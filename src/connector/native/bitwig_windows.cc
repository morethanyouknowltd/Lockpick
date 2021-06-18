#include <iostream>
#include <string>
#include <cstddef>
#include <atomic>
#include <map>
#include <vector>
#include <napi.h>
#include <windows.h>
#include <psapi.h>
#include <functional>
#include <tlhelp32.h>
#include <tchar.h>

using namespace std::string_literals;

std::string activeApplication = "";
std::map<std::string, HANDLE> appDataByProcessName = {};

HANDLE GetProcessByNameImpl(const TCHAR* szProcessName, bool allowPartialMatch = true)
{
    DWORD aProcesses[1024], cbNeeded, cProcesses;
    if (!EnumProcesses(aProcesses, sizeof(aProcesses), &cbNeeded))
        return NULL;

    // Calculate how many process identifiers were returned.
    cProcesses = cbNeeded / sizeof(DWORD);

    // Print the name and process identifier for each process.
    for (unsigned int i = 0; i < cProcesses; i++)
    {
        DWORD dwProcessID = aProcesses[i];
        // Get a handle to the process.
        HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, dwProcessID);

        // Get the process name.
        TCHAR szEachProcessName[MAX_PATH];
        if (hProcess != NULL)
        {
            HMODULE hMod;
            DWORD cbNeeded;

            if (EnumProcessModules(hProcess, &hMod, sizeof(hMod), &cbNeeded))
            {
                GetModuleBaseName(hProcess, hMod, szEachProcessName, sizeof(szEachProcessName) / sizeof(TCHAR));
            }
        }

        if (allowPartialMatch) {
            if (strncmp(szProcessName, szEachProcessName, strlen(szProcessName)) == 0)
                return hProcess;
        } else {
            if(strcmp(szProcessName, szEachProcessName) == 0)
                return hProcess;
        }

        CloseHandle(hProcess);
    }

    return NULL;
}

HANDLE GetProcessByName(const TCHAR *szProcessName)
{
    if (appDataByProcessName.count(szProcessName))
    {
        auto data = appDataByProcessName[szProcessName];
        auto processId = GetProcessId(data);
        if (processId == 0)
        {
            // If process id is no longer valid, remove from our map
            CloseHandle(appDataByProcessName[szProcessName]);
            appDataByProcessName.erase(szProcessName);
        }
    }

    auto count = appDataByProcessName.count(szProcessName);

    // Add process if it doesn't exist (or got removed)
    if (!appDataByProcessName.count(szProcessName))
    {
        auto process = GetProcessByNameImpl(szProcessName);
        if (process != NULL)
        {
            appDataByProcessName[szProcessName] = process;
        }
        else
        {
            return NULL;
        }
    }

    return appDataByProcessName[szProcessName];
}

Napi::Value AccessibilityEnabled(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Boolean::New(
        env,
        true);
}

HANDLE getAudioEngineHandle()
{
    HANDLE h = NULL;
    if ((h = GetProcessByName("BitwigPluginHost64.exe")) != NULL)
    {
        return h;
    }
    else if ((h = GetProcessByName("BitwigPluginHost32.exe")) != NULL)
    {
        return h;
    }
    else if ((h = GetProcessByName("BitwigAudioEngineAVX2.exe")) != NULL)
    {
        return h;
    }
    else if ((h = GetProcessByName("BitwigAudioEngine.exe")) != NULL)
    {
        return h;
    }
    return NULL;
}

HANDLE getBitwigStudioHandle()
{
    return GetProcessByName("Bitwig Studio.exe");
}

BOOL enumerateProcessThreads(DWORD dwOwnerPID, const std::function<BOOL(DWORD)> &func)
{
    HANDLE hThreadSnap = INVALID_HANDLE_VALUE;
    THREADENTRY32 te32;

    // Take a snapshot of all running threads
    hThreadSnap = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
    if (hThreadSnap == INVALID_HANDLE_VALUE)
        return (FALSE);

    // Fill in the size of the structure before using it.
    te32.dwSize = sizeof(THREADENTRY32);

    // Retrieve information about the first thread,
    // and exit if unsuccessful
    if (!Thread32First(hThreadSnap, &te32))
    {
        // printError( TEXT("Thread32First") );  // Show cause of failure
        CloseHandle(hThreadSnap); // Must clean up the snapshot object!
        return (FALSE);
    }

    // Now walk the thread list of the system,
    // and display information about each thread
    // associated with the specified process
    do
    {
        if (te32.th32OwnerProcessID == dwOwnerPID)
        {
            // _tprintf( TEXT("\n     THREAD ID      = 0x%08X"), te32.th32ThreadID );
            // _tprintf( TEXT("\n     base priority  = %d"), te32.tpBasePri );
            // _tprintf( TEXT("\n     delta priority = %d"), te32.tpDeltaPri );

            func(te32.th32ThreadID);
        }
    } while (Thread32Next(hThreadSnap, &te32));

    _tprintf(TEXT("\n"));

    //  Don't forget to clean up the snapshot object.
    CloseHandle(hThreadSnap);
    return (TRUE);
}

std::function<BOOL(HWND)> defaultPluginWindowEnumerator = [](HWND hWnd) -> BOOL
{
    return true;
};
std::function<BOOL(HWND)> pluginWindowEnumerator = defaultPluginWindowEnumerator;

void enumeratePluginWindowsAndResetEnumerator()
{
    auto handle = getAudioEngineHandle();
    auto processId = GetProcessId(handle);
    if (processId == 0)
    {
        return;
    }
    enumerateProcessThreads(processId, [&](DWORD threadId) -> BOOL
                            {
                                EnumThreadWindows(
                                    threadId, [](HWND hWnd, LPARAM lParam) -> BOOL
                                    { return pluginWindowEnumerator(hWnd); },
                                    0);
                                return true;
                            });
    pluginWindowEnumerator = defaultPluginWindowEnumerator;
}

Napi::Value GetPluginWindowsPosition(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::Object outObj = Napi::Object::New(env);
    pluginWindowEnumerator = [&](HWND hWnd) -> BOOL
    {
        TCHAR buff[255];
        RECT rect;
        GetWindowText(hWnd, (LPSTR)buff, 254);
        GetWindowRect(hWnd, &rect);
        if (strcmp("MSCTFIME UI", buff) == 0 || strcmp("Default IME", buff) == 0)
        {
            // Dunno what these are, but they cause problems
            return TRUE;
        }
        if (rect.right - rect.left <= 0 || rect.bottom - rect.top <= 0)
        {
            // MSCTFIME UI window? has no width/height, possibly causing crashes
        }
        auto obj = Napi::Object::New(env);
        obj.Set(Napi::String::New(env, "x"), Napi::Number::New(env, rect.left));
        obj.Set(Napi::String::New(env, "y"), Napi::Number::New(env, rect.top));
        obj.Set(Napi::String::New(env, "w"), Napi::Number::New(env, rect.right - rect.left));
        obj.Set(Napi::String::New(env, "h"), Napi::Number::New(env, rect.bottom - rect.top));
        obj.Set(Napi::String::New(env, "id"), Napi::String::New(env, buff));
        outObj.Set(Napi::String::New(env, buff), obj);
        return TRUE;
    };
    enumeratePluginWindowsAndResetEnumerator();
    return outObj;
}

Napi::Value GetPluginWindowsCount(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, 0);
}

Napi::Value SetPluginWindowsPosition(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    auto inObject = info[0].As<Napi::Object>();
    pluginWindowEnumerator = [&](HWND hWnd) -> BOOL
    {
        TCHAR buff[255];
        RECT rect;
        GetWindowText(hWnd, (LPSTR)buff, 254);

        if (strcmp("MSCTFIME UI", buff) == 0 || strcmp("Default IME", buff) == 0)
        {
            // Dunno what these are, but they cause problems
            return TRUE;
        }
        auto posForWindow = inObject.Get(buff).As<Napi::Object>();
        GetWindowRect(hWnd, &rect);
        if (rect.right - rect.left <= 0 || rect.bottom - rect.top <= 0)
        {
            // MSCTFIME UI window? has no width/height, possibly causing crashes
        }
        SetWindowPos(hWnd,
                     HWND_NOTOPMOST,
                     posForWindow.Get("x").As<Napi::Number>(),
                     posForWindow.Get("y").As<Napi::Number>(),
                     rect.right - rect.left,
                     rect.bottom - rect.top,
                     0);
        return TRUE;
    };
    enumeratePluginWindowsAndResetEnumerator();
    return Napi::Value();
}

Napi::Value FocusPluginWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::string id = info[0].As<Napi::String>();
    return Napi::Value();
}

bool isAppActive(std::string app)
{
    std::size_t found = activeApplication.find(app);
    return found != std::string::npos;
}

bool isBitwigActive()
{
    return isAppActive("Bitwig Studio.exe");
}

bool isPluginWindowActive()
{
    return isAppActive("BitwigPluginHost64.exe") || isAppActive("BitwigPluginHost32.exe") || isAppActive("BitwigAudioEngineAVX2.exe") || isAppActive("BitwigAudioEngine.exe");
}

Napi::Value IsActiveApplication(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info[0].IsString())
    {
        return Napi::Boolean::New(
            env,
            isAppActive(info[0].As<Napi::String>()));
    }
    return Napi::Boolean::New(
        env,
        isBitwigActive() || isPluginWindowActive());
}

Napi::Value MakeMainWindowActive(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Boolean::New(
        env,
        false);
}

Napi::Value IsPluginWindowActive(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Boolean::New(
        env,
        isPluginWindowActive());
}

Napi::Value CloseFloatingWindows(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    pluginWindowEnumerator = [&](HWND hWnd) -> BOOL
    {
        SendMessage(hWnd, WM_CLOSE, NULL, NULL);
        return TRUE;
    };
    enumeratePluginWindowsAndResetEnumerator();
    return Napi::Boolean::New(env, true);
}

Napi::Value GetPid(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, -1);
}

HWINEVENTHOOK foregroundEventHook;

void CALLBACK WinEventProc(
    HWINEVENTHOOK hWinEventHook,
    DWORD event,
    HWND hwnd,
    LONG idObject,
    LONG idChild,
    DWORD idEventThread,
    DWORD dwmsEventTime)
{
    DWORD processId;
    GetWindowThreadProcessId(
        hwnd,
        &processId);

    HANDLE processHandle = OpenProcess(
        PROCESS_QUERY_INFORMATION,
        FALSE,
        processId);

    DWORD maxPath = MAX_PATH;
    TCHAR app_path[MAX_PATH];
    auto result = QueryFullProcessImageNameA(
        processHandle,
        0,
        app_path,
        &maxPath);

    if (result != 0)
    {
        activeApplication = app_path;
        std::cout << ("Active application set to " + activeApplication) << std::endl;
    }

    CloseHandle(processHandle);
}

void InitBitwigOS(Napi::Env env, Napi::Object exports)
{
    foregroundEventHook = SetWinEventHook(
        EVENT_SYSTEM_FOREGROUND,
        EVENT_SYSTEM_FOREGROUND,
        NULL,
        WinEventProc,
        0,
        0,
        WINEVENT_OUTOFCONTEXT);
    if (!foregroundEventHook)
    {
        std::cout << "Couldn't set foreground hook" << std::endl;
    }
}
