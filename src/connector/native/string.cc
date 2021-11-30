#include "string.h"

#if defined(IS_WINDOWS)
    LPCWSTR strToLPCWSTR(std::string s) {
        int len;
        int slength = (int)s.length() + 1;
        len = MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, 0, 0); 
        wchar_t* buf = new wchar_t[len];
        MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, buf, len);
        std::wstring r(buf);
        delete[] buf;
        return r.c_str();
    }
#endif

#if defined(IS_MACOS)
    std::string CFStringToString(CFStringRef cfString) {
        CFIndex bufferSize = CFStringGetLength(cfString) + 1; // The +1 is for having space for the string to be NUL terminated
        char buffer[bufferSize];

        // CFStringGetCString is documented to return a false if the buffer is too small 
        // (which shouldn't happen in this example) or if the conversion generally fails    
        if (CFStringGetCString(cfString, buffer, bufferSize, kCFStringEncodingUTF8))
        {
            return std::string (buffer);
        }
        return "";
    }
#endif