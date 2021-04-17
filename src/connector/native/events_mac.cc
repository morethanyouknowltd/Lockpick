#include "point.h"
#include "events.h"
#include "eventsource.h"
#include "keycodes.h"
#include <CoreGraphics/CoreGraphics.h>
#include <iostream>
#include <vector>
#include <forward_list>
#include <thread>
#include <string>
#include <map>
#include <string>
#include <mutex>
#include <stdexcept>
#include <chrono>
#include <future>

using std::forward_list;

bool threadSetup = false;
std::thread nativeThread;
std::promise<void> exitSignal;
CFRunLoopRef runLoop = nullptr;

struct WaitingLoopSrc {
    CallbackInfo* callbackInfo;
    int id; // Same id as callback info
    // CFRunLoopSourceRef loopSrc;
};
int nextId = 0;
std::vector<WaitingLoopSrc> waitingCbInfo;
std::mutex m;

forward_list<CallbackInfo*> callbacks; 
int lastMouseDownButton = 0;

Napi::Value beforeQuitOS(const Napi::CallbackInfo &info) {
    exitSignal.set_value();
    std::cout << "Waiting for thread to join" << std::endl;
    if (threadSetup) {
        CFRunLoopStop(runLoop);
        nativeThread.join();
    }
    std::cout << "Thread joined" << std::endl;
}

void processCallback(Napi::Env env, Napi::Function jsCallback, JSEvent* value) {
    Napi::Object obj = Napi::Object::New(env);

    obj.Set(Napi::String::New(env, "Meta"), Napi::Boolean::New(env, value->Meta));
    obj.Set(Napi::String::New(env, "Shift"), Napi::Boolean::New(env, value->Shift));
    obj.Set(Napi::String::New(env, "Control"), Napi::Boolean::New(env, value->Control));
    obj.Set(Napi::String::New(env, "Alt"), Napi::Boolean::New(env, value->Alt));
    obj.Set(Napi::String::New(env, "Fn"), Napi::Boolean::New(env, value->Fn));

    obj.Set(Napi::String::New(env, "x"), Napi::Number::New(env, value->x));
    obj.Set(Napi::String::New(env, "y"), Napi::Number::New(env, value->y));
    obj.Set(Napi::String::New(env, "button"), Napi::Number::New(env, value->button));

    jsCallback.Call( {obj} );
}

int skipMouseMoveUntilZero = 6;

CGEventRef eventtap_callback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon) {
    if (CGEventGetIntegerValueField(event, kCGEventSourceUserData) == 42) {
        // Skip our own events
        return event;
    }

    // std::cout << "callback" << std::endl;
    
    CallbackInfo* e = (CallbackInfo*) refcon;    
    
    // hammerspoon says OS X disables eventtaps if it thinks they are slow or odd or just because the moon
    // is wrong in some way... but at least it's nice enough to tell us.
    if ((type == kCGEventTapDisabledByTimeout) || (type == kCGEventTapDisabledByUserInput)) {
        CGEventTapEnable(e->tap, true);
        return event;
    }

    if ((type == kCGEventMouseMoved || type == kCGEventOtherMouseDragged)) {
        // Only process 1 in 20 mouse move events to save a lot of CPU
        if (skipMouseMoveUntilZero != 0) {
            skipMouseMoveUntilZero--;
            return event;
        } else {
            skipMouseMoveUntilZero = 20;
        }
    }

    JSEvent *jsEvent = new JSEvent();
    jsEvent->type = e->eventType;


    CGEventFlags flags = CGEventGetFlags(event);
    if ((flags & kCGEventFlagMaskAlphaShift) != 0) {
        jsEvent->Shift = true;
    } 
    if ((flags & kCGEventFlagMaskShift) != 0) {
        jsEvent->Shift = true;
    }
    if ((flags & kCGEventFlagMaskControl) != 0) {
        jsEvent->Control = true;
    }
    if ((flags & kCGEventFlagMaskAlternate) != 0) {
        jsEvent->Alt = true;
    }
    if ((flags & kCGEventFlagMaskCommand) != 0) {
        jsEvent->Meta = true;
    }
    if ((flags & kCGEventFlagMaskSecondaryFn) != 0) {
        jsEvent->Fn = true;
    }

    // TODO Check other thread access is 100% ok
    if (type == kCGEventKeyDown || 
        type == kCGEventKeyUp ||
        type == kCGEventFlagsChanged) {
        // Keyboard event

        auto callback = []( Napi::Env env, Napi::Function jsCallback, JSEvent* value ) {
        Napi::Object obj = Napi::Object::New(env);

            obj.Set(Napi::String::New(env, "nativeKeyCode"), Napi::Number::New(env, value->nativeKeyCode));
            obj.Set(Napi::String::New(env, "lowerKey"), Napi::String::New(env, value->lowerKey));
            obj.Set(Napi::String::New(env, "Meta"), Napi::Boolean::New(env, value->Meta));
            obj.Set(Napi::String::New(env, "Shift"), Napi::Boolean::New(env, value->Shift));
            obj.Set(Napi::String::New(env, "Control"), Napi::Boolean::New(env, value->Control));
            obj.Set(Napi::String::New(env, "Alt"), Napi::Boolean::New(env, value->Alt));
            obj.Set(Napi::String::New(env, "Fn"), Napi::Boolean::New(env, value->Fn));

            jsCallback.Call( {obj} );

            delete value;
        };        

        jsEvent->nativeKeyCode = CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode);
        jsEvent->lowerKey = stringForKeyCode(jsEvent->nativeKeyCode);

        if (e->cb != nullptr) {
            e->cb.BlockingCall( jsEvent, callback );  
        } 
        if (e->nativeFn != nullptr) {
            e->nativeFn( jsEvent );
            delete jsEvent;
        }
    } else {
        // Mouse event
        CGPoint point = CGEventGetLocation(event);
        jsEvent->x = (int) point.x;
        jsEvent->y = (int) point.y;

        if (type == kCGEventMouseMoved || type == kCGEventOtherMouseDragged) {
            // Mouse movement doesn't have a button (multiple buttons could theoretically be down)
            jsEvent->button = -1;
        } else if (type == kCGEventLeftMouseUp || type == kCGEventLeftMouseDown || type == kCGEventLeftMouseDragged) {
            jsEvent->button = 0;
        } else if (type == kCGEventRightMouseUp || type == kCGEventRightMouseDown || type == kCGEventRightMouseDragged) {
            jsEvent->button = 2;
        } else {
            jsEvent->button = CGEventGetIntegerValueField(event, kCGMouseEventButtonNumber);
            if (jsEvent->button == 2) {
                // Make middle click 1, others are fine as is
                jsEvent->button = 1;
            }
        }
        int button = jsEvent->button;
        int howManyClicks = CGEventGetIntegerValueField(event, kCGMouseEventClickState);
        if (howManyClicks > 1 && button != lastMouseDownButton)  {
            // Skip double clicks from different mouse buttons (this shouldn't happen but it does?)
            CGEventSetIntegerValueField(event, kCGMouseEventClickState, 1);
            // delete jsEvent;
            // return NULL;
        }
        lastMouseDownButton = button;
    
        auto callback = []( Napi::Env env, Napi::Function jsCallback, JSEvent* value ) {
            processCallback(env, jsCallback, value);
            delete value;   
        };
        auto callbackNoDelete = []( Napi::Env env, Napi::Function jsCallback, JSEvent* value ) {
            processCallback(env, jsCallback, value);
        };

        if (button > 2) {
            if (e->nativeFn != nullptr) {
                // TODO Implement for native fns too
                delete jsEvent;
                return event;
            }

            // Don't pass button 3, 4, etc to Bitwig because it just interprets them as middle click,
            // interefering with our ability to map these buttons ourselves

            // Note that because we return NULL, our other callbacks won't be processed, so we have to
            // find them ourselves
            for (auto cbInfo : callbacks) {
                // FIXME when we call the other callbacks the memory of jsEvent is corrupted. For some reason it's
                // not always visible to them. At the moment we're working around this by only using one single cb
                // to process these other buttons - which isn't ideal
                if (cbInfo->eventType == e->eventType && cbInfo != e) {
                    // Call all other listeners except for this one
                    if (cbInfo->cb != nullptr) {
                        cbInfo->cb.BlockingCall( jsEvent, callbackNoDelete );  
                    }
                }
            }
            e->cb.BlockingCall( jsEvent, callback );  
            return NULL;
        } else {
            if (e->cb != nullptr) {
                e->cb.BlockingCall( jsEvent, callback );  
            } 
            if (e->nativeFn != nullptr) {
                e->nativeFn( jsEvent );
                delete jsEvent;
            }
        }
    }
    // can return NULL to ignore event
    return event;
}

CallbackInfo* addEventListener(EventListenerSpec spec) {
    // TODO FREE
    CallbackInfo *ourInfo = new CallbackInfo;
    ourInfo->nativeFn = spec.cb;
    ourInfo->id = nextId++;
    ourInfo->eventType = spec.eventType;
    if (spec.jsFunction != nullptr) {
        // std::cout << "Adding JS Listener";
        ourInfo->cb = Napi::ThreadSafeFunction::New(
            spec.env,
            *spec.jsFunction, // JavaScript function called asynchronously                      
            "Resource Name", // Name         
            0, // Unlimited queue                      
            1 // Initial thread count 
        );                      
    }

    if (!threadSetup) {
        threadSetup = true;
        std::future<void> futureObj = exitSignal.get_future();
        
        nativeThread = std::thread( [] (std::future<void> futureObj) {
            runLoop = CFRunLoopGetCurrent();
            while (futureObj.wait_for(std::chrono::milliseconds(1)) == std::future_status::timeout) {
                CFRunLoopRunInMode(kCFRunLoopDefaultMode, 60, true);
                m.lock();
                if (waitingCbInfo.size() > 0) {
                    for(auto info : waitingCbInfo) {
                        auto thisInfo = info.callbackInfo;
                        CGEventMask mask = kCGEventMaskForAllEvents;
                        if ("keyup" == thisInfo->eventType) {
                            mask = CGEventMaskBit(kCGEventKeyUp);
                        } else if ("keydown" == thisInfo->eventType) {
                            mask = CGEventMaskBit(kCGEventKeyDown);
                        } else if ("mousemove" == thisInfo->eventType) {
                            mask = CGEventMaskBit(kCGEventMouseMoved) | CGEventMaskBit(kCGEventOtherMouseDragged);
                        } else if ("mousedown" == thisInfo->eventType) {
                            mask = CGEventMaskBit(kCGEventLeftMouseDown) | CGEventMaskBit(kCGEventRightMouseDown) | CGEventMaskBit(kCGEventOtherMouseDown);
                        } else if ("mouseup" == thisInfo->eventType) {
                            mask = CGEventMaskBit(kCGEventLeftMouseUp) | CGEventMaskBit(kCGEventRightMouseUp) | CGEventMaskBit(kCGEventOtherMouseUp);
                        } else if ("scroll" == thisInfo->eventType) {
                            mask = CGEventMaskBit(kCGEventScrollWheel);
                        } else {
                            throw std::invalid_argument("Unrecognised event type: " + thisInfo->eventType);
                        }

                        thisInfo->tap = CGEventTapCreate(
                                kCGSessionEventTap,
                                kCGHeadInsertEventTap,
                                kCGEventTapOptionDefault,
                                mask,
                                eventtap_callback,
                                thisInfo);
                        if (!thisInfo->tap) {
                            std::cout << "Could not create event tap.";
                        } else {
                            CGEventTapEnable(thisInfo->tap, true);
                            thisInfo->runloopsrc = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, thisInfo->tap, 0);
                            CFRunLoopAddSource(runLoop, thisInfo->runloopsrc, kCFRunLoopCommonModes);
                        }
                    }
                }
                waitingCbInfo.clear();
                m.unlock();
            }
        }, std::move(futureObj));
    }

    m.lock();
    callbacks.push_front(ourInfo);
    waitingCbInfo.push_back(WaitingLoopSrc{
        .callbackInfo = ourInfo
    });
    m.unlock();
    if (runLoop != nullptr) {
        CFRunLoopStop(runLoop);
    }
    return ourInfo;
}

/// Note that mousemove events seem to get fired when mouse is clicked too - TODO investigate
Napi::Value on(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    auto eventType = info[0].As<Napi::String>().Utf8Value();
    auto cb = info[1].As<Napi::Function>();
    auto ourInfo = addEventListener(EventListenerSpec({
        eventType,
        nullptr,
        &cb,
        env
    }));
    return Napi::Number::New(env, ourInfo->id);
}

Napi::Value off(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    int id = info[0].As<Napi::Number>();
    m.lock();
    callbacks.remove_if([=](CallbackInfo *e){ 
        bool willRemove = e->id == id;     
        if (willRemove) {
            // free it
            delete e;
        }
        return willRemove;
    });
    // The callbackInfo could be in another pointer waiting to be added to 
    // the run loop in `on`. So remove it there too
    // waitingCbInfo.remove_if([=](WaitingLoopSrc src){ 
    //     return src.id == id;
    // });
    waitingCbInfo.erase(
    std::remove_if(waitingCbInfo.begin(), waitingCbInfo.end(),
        [=](WaitingLoopSrc o) { return o.id == id; }),
    waitingCbInfo.end());
    m.unlock();
    return Napi::Boolean::New(env, true);
}

Napi::Value keyPresser(const Napi::CallbackInfo &info, bool down) {
    Napi::Env env = info.Env();

    std::string s = info[0].As<Napi::String>();
    CGKeyCode keyCode = keyCodeForString(s);    
    CGEventFlags flags = (CGEventFlags)0;
    bool lockpickListeners = false;
    if (info[1].IsObject()) {
        Napi::Object obj = info[1].As<Napi::Object>();
        if (obj.Has("Meta")) {
            flags |= kCGEventFlagMaskCommand;
        }
        if (obj.Has("Shift")) {
            flags |= kCGEventFlagMaskShift;
        }
        if (obj.Has("Alt")) {
            flags |= kCGEventFlagMaskAlternate;
        }
        if (obj.Has("Control")) {
            flags |= kCGEventFlagMaskControl;
        }
        if (obj.Has("Fn")) {
            flags |= kCGEventFlagMaskSecondaryFn;
        }
        lockpickListeners = obj.Has("lockpickListeners") && obj.Get("lockpickListeners").As<Napi::Boolean>();
    }
    CGEventRef keyevent = CGEventCreateKeyboardEvent(getCGEventSource(lockpickListeners), keyCode, down);
    CGEventSetFlags(keyevent, flags);
    CGEventPost(kCGSessionEventTap, keyevent);
    CFRelease(keyevent);
    return Napi::Boolean::New(env, true);
}

Napi::Value keyDown(const Napi::CallbackInfo &info) {
    return keyPresser(info, true);
}

Napi::Value keyUp(const Napi::CallbackInfo &info) {
    return keyPresser(info, false);
}

Napi::Value keyPress(const Napi::CallbackInfo &info) {
    keyDown(info);
    usleep(10000);
    return keyUp(info);
}

Napi::Value InitKeyboardOS(Napi::Env env, Napi::Object exports) {}