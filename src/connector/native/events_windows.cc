#include <windows.h>
#include <napi.h>
#include <vector>
#include <mutex>
#include <map>
#include <string>
#include <thread>
#include "events.h"
#include "keycodes.h"
#include "string.h"

int nextId = 0;
bool threadSetup = false;
std::thread nativeThread;
std::mutex m;
HWND messageWindow;

std::atomic<bool> quitting(false);

std::map<std::string,std::vector<CallbackInfo*>> callbacksByEventType = {};

CallbackInfo* addEventListener(EventListenerSpec spec) {
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
    if (!callbacksByEventType.count(spec.eventType)) {
        callbacksByEventType[spec.eventType] = {};
    }
    m.lock();
    callbacksByEventType[spec.eventType].push_back(ourInfo);
    m.unlock();
    return ourInfo;
}

typedef struct tagMYREC
{
    char type[80];
    UINT x;
    UINT y;
    UINT button;
} MYREC;

typedef struct tagKEY
{
    UINT vkCode;
    bool down;
    bool shift, control, alt;
} KEY;

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
    for (auto const& [eventType, callbacks] : callbacksByEventType)
    {
        auto nonConstCbs = callbacksByEventType[eventType];
        auto removeIf = std::remove_if(nonConstCbs.begin(), nonConstCbs.end(), [=](CallbackInfo* e){ 
            bool willRemove = e->id == id;     
            if (willRemove) {
                // free it
                delete e;
            }
            return willRemove;
        });
        nonConstCbs.erase(removeIf, nonConstCbs.end());
        callbacksByEventType[eventType] = nonConstCbs;
    }
    m.unlock();
    return Napi::Boolean::New(env, true);
}

Napi::Value keyPresser(const Napi::CallbackInfo &info, bool down) {
    Napi::Env env = info.Env();
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
    Sleep(10000);
    return keyUp(info);
}

JSEvent jsEvent;
LRESULT CALLBACK WindowProc(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    // std::cout << "Got something" << uMsg <<  std::endl;

    MYREC* e;
    KEY* b;

    if (uMsg == WM_DESTROY) {
        PostQuitMessage(0);
    } else if (uMsg == WM_COPYDATA) {
      std::cout << "Got a message!" << std::endl;
      auto pMyCDS = (PCOPYDATASTRUCT) lParam;
      switch( pMyCDS->dwData )
      {
          case 1:
              // Mouse event
            e = (MYREC*)pMyCDS->lpData;
            // std::cout << "Got a mouse event message!" << std::endl;
            jsEvent.type = e->type;
            jsEvent.button = e->button;
            jsEvent.x = e->x;
            jsEvent.y = e->y;
            auto callback = []( Napi::Env env, Napi::Function jsCallback, JSEvent* value ) {
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
            };
            m.lock();
            if (callbacksByEventType.count(e->type)) {
                auto callbacks = callbacksByEventType[e->type];
                for (auto cb : callbacks) {
                    cb->cb.BlockingCall( &jsEvent, callback );
                }
            }
            m.unlock();
            break;
          case 2:
              // KeyboardEvent event
            b = (KEY*)pMyCDS->lpData;
            // std::cout << "Got a keyboard event message!" << std::endl;
            jsEvent.type = b->down ? "keydown" : "keyup";
            jsEvent.lowerKey = stringForKeyCode(b->vkCode);
            jsEvent.nativeKeyCode = b->vkCode;
            jsEvent.Meta = false;
            jsEvent.Control = b->control;
            jsEvent.Alt = b->alt;
            jsEvent.Shift = b->shift;
            jsEvent.Fn = false;

            auto keyboardCallback = []( Napi::Env env, Napi::Function jsCallback, JSEvent* value ) {
                Napi::Object obj = Napi::Object::New(env);

                obj.Set(Napi::String::New(env, "nativeKeyCode"), Napi::Number::New(env, value->nativeKeyCode));
                obj.Set(Napi::String::New(env, "lowerKey"), Napi::String::New(env, value->lowerKey));
                obj.Set(Napi::String::New(env, "Meta"), Napi::Boolean::New(env, value->Meta));
                obj.Set(Napi::String::New(env, "Shift"), Napi::Boolean::New(env, value->Shift));
                obj.Set(Napi::String::New(env, "Control"), Napi::Boolean::New(env, value->Control));
                obj.Set(Napi::String::New(env, "Alt"), Napi::Boolean::New(env, value->Alt));
                obj.Set(Napi::String::New(env, "Fn"), Napi::Boolean::New(env, value->Fn));

                jsCallback.Call( {obj} );
            };
            m.lock();
            if (callbacksByEventType.count(jsEvent.type)) {
                auto callbacks = callbacksByEventType[jsEvent.type];
                for (auto cb : callbacks) {
                    cb->cb.BlockingCall( &jsEvent, keyboardCallback );
                }
            }
            m.unlock(); 
            break;
      }
    }

    return DefWindowProc(hWnd, uMsg, wParam, lParam);
}

Napi::Value beforeQuitOS(const Napi::CallbackInfo &info) {
    quitting.store(true);
    std::cout << "Waiting for thread to join" << std::endl;
    if (threadSetup) {
        SendNotifyMessage(
            messageWindow,
            WM_DESTROY,
            0,
            0);
        nativeThread.join();
    }
    std::cout << "Thread joined" << std::endl;
    return Napi::Value();
}

typedef int (__cdecl *MYPROC)(HWND); 

Napi::Value setupThread(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    std::string dllPath = info[0].As<Napi::String>();
    nativeThread = std::thread( [=] {
        HINSTANCE hInstance = GetModuleHandle(0);
        WNDCLASS windowClass = {};
        windowClass.lpfnWndProc = WindowProc;
        windowClass.lpszClassName = "FoobarMessageOnlyWindow";
        if (!RegisterClass(&windowClass)) {
            std::cout << "Failed to register window class" << std::endl;
            return 1;
        }
        messageWindow = CreateWindowA("FoobarMessageOnlyWindow", 0, 0, 0, 0, 0, 0, HWND_MESSAGE, 0, 0, 0);
        if (!messageWindow) {
            std::cout << "Failed to create message-only window" << std::endl;
            return 1;
        }

        auto hinstDLL = LoadLibrary(dllPath.c_str());
        auto setMyHook = (MYPROC)GetProcAddress(hinstDLL, "setMyHook");
        setMyHook(messageWindow);

        MSG msg;
        std::cout << "Entering while loop" << std::endl;

        while (!quitting.load() && GetMessage(&msg, NULL, 0, 0) > 0) {
            std::cout << "While looping" << std::endl << std::flush;
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        std::cout << "Exiting Windows message thread" << std::endl;
    } );
    threadSetup = true;
    return Napi::Value();
}


Napi::Value InitKeyboardOS(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "setupThread"), Napi::Function::New(env, setupThread));
    return exports;
}