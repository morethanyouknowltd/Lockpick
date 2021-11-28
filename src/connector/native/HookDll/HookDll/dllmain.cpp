// dllmain.cpp : Defines the entry point for the DLL application.
#include "pch.h"

// This data will be shared amongst all instances of the DLL
#pragma comment(linker, "/SECTION:.SHARED,RWS")
#pragma data_seg(".SHARED")
HWND hWndServer = NULL;
HHOOK mouseHook;
HHOOK keyboardHook;
#pragma data_seg()

bool isMainDLL = false;

// Instance-specific data
HMODULE hInstance = NULL;

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

HRESULT hResult;

// Forward declaration
static LRESULT CALLBACK mouseHookProc(int nCode, WPARAM wParam, LPARAM lParam);
static LRESULT CALLBACK keyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam);

extern "C" __declspec(dllexport) BOOL WINAPI setMyHook(HWND hWnd)
{
  if (hWndServer != NULL)
    return FALSE;

  isMainDLL = true;

  mouseHook = SetWindowsHookEx(
      WH_MOUSE,
      (HOOKPROC)mouseHookProc,
      hInstance,
      0);
  keyboardHook = SetWindowsHookEx(
      WH_KEYBOARD,
      (HOOKPROC)keyboardHookProc,
      hInstance,
      0);
  hWndServer = hWnd;

  if (mouseHook != NULL && keyboardHook != NULL)
  {
    std::cout << "hook installed successfully" << std::endl;
    // success
    return TRUE;
  }
  std::cout << "hook installation failed" << std::endl;
  return FALSE;
}

extern "C" __declspec(dllexport) BOOL clearMyHook(HWND hWnd)
{
  if (hWnd != hWndServer)
    return FALSE;

  BOOL unhooked = UnhookWindowsHookEx(mouseHook) && UnhookWindowsHookEx(keyboardHook);

  hWndServer = NULL;
  return unhooked;
}

BOOL APIENTRY DllMain(HMODULE hModule,
                      DWORD ul_reason_for_call,
                      LPVOID lpReserved)
{
  switch (ul_reason_for_call)
  {
  case DLL_PROCESS_ATTACH:
    // Save the instance handle because we need it to set the hook later
    hInstance = hModule;
    std::cout << "Attaching hook..." << std::endl;
    return TRUE;
  case DLL_THREAD_ATTACH:
    return TRUE;
  case DLL_THREAD_DETACH:
    return TRUE;
  case DLL_PROCESS_DETACH:
    std::cout << "Detaching hook..." << std::endl;
    // If the server has not unhooked the hook, unhook it as we unload
    if (hWndServer != NULL && isMainDLL)
      clearMyHook(hWndServer);
    return TRUE;
  }
  return TRUE;
}

static LRESULT CALLBACK mouseHookProc(int nCode, WPARAM wParam, LPARAM lParam)
{
  // If the value of nCode is < 0, just pass it on and return 0
  // this is required by the specification of hook handlers
  if (nCode < 0)
  { /* pass it on */
    CallNextHookEx(mouseHook, nCode,
                   wParam, lParam);
    return 0;
  } /* pass it on */

  // std::cout << "Mouse hook proc triggered" << std::endl;

  COPYDATASTRUCT MyCDS;
  MYREC MyRec;
  MyCDS.cbData = sizeof(MyRec);
  MyCDS.dwData = 1;
  MyCDS.lpData = &MyRec;

  if (wParam == WM_LBUTTONDOWN || wParam == WM_LBUTTONUP || wParam == WM_RBUTTONDOWN || wParam == WM_RBUTTONUP)
  {

    std::cout << "Button up/down" << std::endl;
    MyRec.x = GET_X_LPARAM(lParam);
    MyRec.y = GET_Y_LPARAM(lParam);

#pragma warning(push)
#pragma warning(disable : 4996)
    if (wParam == WM_LBUTTONDOWN || wParam == WM_RBUTTONDOWN)
    {
      strcpy(MyRec.type, "mousedown");
      MyRec.button = WM_LBUTTONDOWN ? 0 : 1;
    }
    else if (wParam == WM_LBUTTONUP || wParam == WM_RBUTTONUP)
    {
      strcpy(MyRec.type, "mouseup");
      MyRec.button = WM_LBUTTONUP ? 0 : 1;
    }
#pragma warning(pop)
    // Must use SendMessage vs PostMessage here because copy data
    // needs to know when to free the copied memory
    SendNotifyMessage(
        hWndServer,
        WM_COPYDATA,
        0,
        (LPARAM)(LPVOID)&MyCDS);
  }

  // Pass the message on to the next hook
  return CallNextHookEx(mouseHook, nCode,
                        wParam, lParam);
}

static LRESULT CALLBACK keyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam)
{

  // If the value of nCode is < 0, just pass it on and return 0
  // this is required by the specification of hook handlers
  if (nCode < 0)
  { /* pass it on */
    std::cout << "Keyboard hook proc bypassed" << std::endl;
    CallNextHookEx(mouseHook, nCode,
                   wParam, lParam);
    return 0;
  } /* pass it on */

  COPYDATASTRUCT MyCDS;
  tagKEY MyRec;
  MyRec.vkCode = wParam;
  MyRec.down = lParam & (1U << 31);
  MyRec.shift = GetKeyState(VK_SHIFT) & 0x8000;
  MyRec.alt = GetKeyState(VK_MENU) & 0x8000;
  MyRec.control = GetKeyState(VK_CONTROL) & 0x8000;

  MyCDS.cbData = sizeof(MyRec);
  MyCDS.dwData = 2;
  MyCDS.lpData = &MyRec;
  std::cout << "Keyboard hook proc triggered" << std::endl;

  // Must use SendMessage vs PostMessage here because copy data
  // needs to know when to free the copied memory
  SendNotifyMessage(hWndServer,
                    WM_COPYDATA,
                    0,
                    (LPARAM)(LPVOID)&MyCDS);

  // Pass the message on to the next hook
  return CallNextHookEx(keyboardHook, nCode,
                        wParam, lParam);
}
