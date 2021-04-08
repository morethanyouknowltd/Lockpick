#pragma once
#include <napi.h>
#include <functional>
#include <string>
#include <iostream>

#if defined(IS_MACOS)
    #include <CoreGraphics/CoreGraphics.h>
#elif defined(IS_WINDOWS)
    #include <windows.h>
#endif

struct JSEvent {
    uint16_t nativeKeyCode;
    std::string type;
    std::string lowerKey;
    bool Meta, Shift, Control, Alt, Fn;
    int button, x, y;
    ~JSEvent() {
        // std::cout << "deleting jsevent";
    }
};

struct CallbackInfo {
    int id;
    std::string eventType;

    /**
     * The JS callback to call (optional)
     */    
    Napi::ThreadSafeFunction cb = nullptr;

    /**
     * We use these callbacks internally in C++ world, so a JS functio
     * isn't always necessary (optional)
     */
    std::function<void(JSEvent*)> nativeFn = nullptr;
    
    #if defined(IS_MACOS)
        CGEventMask mask;
        CFMachPortRef tap = nullptr;
        CFRunLoopSourceRef runloopsrc = nullptr;
    #elif defined(IS_WINDOWS)
    #endif

    ~CallbackInfo() {
        #if defined(IS_MACOS)
            if (cb != nullptr) {
                cb.Release();
            }

            // std::cout << "removing callbackinfo";

            if (tap && CGEventTapIsEnabled(tap)) {
                CGEventTapEnable(tap, false);
                CFMachPortInvalidate(tap);
                CFRelease(tap);
            }

            if (runloopsrc) {
                CFRunLoopRemoveSource(CFRunLoopGetMain(), runloopsrc, kCFRunLoopCommonModes);
                CFRelease(runloopsrc);
            }
        #endif
    }
};

struct EventListenerSpec {
    std::string eventType;
    std::function<void(JSEvent*)> cb = nullptr;
    Napi::Function* jsFunction = nullptr;
    Napi::Env env = nullptr; 
};

CallbackInfo* addEventListener(EventListenerSpec spec);

Napi::Value InitKeyboard(Napi::Env env, Napi::Object exports);