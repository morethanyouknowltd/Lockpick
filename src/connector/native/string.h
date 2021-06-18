#pragma once
#include <string>

#if defined(IS_WINDOWS)
    #include <windows.h>
    LPCWSTR strToLPCWSTR(std::string str);
#endif

#if defined(IS_MACOS)
    #include <CoreGraphics/CoreGraphics.h>
    std::string CFStringToString(CFStringRef cfString);
#endif

