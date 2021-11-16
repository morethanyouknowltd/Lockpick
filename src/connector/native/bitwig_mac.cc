
#include <napi.h>
#include <iostream>
#include <string>
#include <shared_mutex>
#include <cstddef>
#include <atomic>
#include <map>
#include <set>
#include <vector>
#include <CoreGraphics/CoreGraphics.h>
#include <ApplicationServices/ApplicationServices.h>
#include "string.h"
using namespace std::string_literals;

struct AppData
{
  AXUIElementRef ref;
  pid_t pid;
};
std::map<std::string, AppData> appDataByProcessName = {};

std::string activeApp;
static std::atomic<bool> activeAppDirty(true);

// std set of process ids
std::set<pid_t> processIds = {};
// process ids shared mutex
std::shared_mutex processIdsMutex;

// add to process ids protected by shared mutex
void addProcessId(pid_t pid)
{
  std::lock_guard<std::shared_mutex> g(processIdsMutex);
  processIds.insert(pid);
  std::cout << "added" << pid << std::endl;
}
void removeProcessId(pid_t pid)
{
  std::lock_guard<std::shared_mutex> g(processIdsMutex);
  processIds.erase(pid);
  std::cout << "removed" << pid << std::endl;
}

bool pidIsAlive(pid_t pid)
{
  return 0 == kill(pid, 0);
}

pid_t GetPID(std::string name)
{
  // Go through all on screen windows, find BW
  CFArrayRef array = CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements, kCGNullWindowID);
  CFIndex count = CFArrayGetCount(array);
  for (CFIndex i = 0; i < count; i++)
  {
    CFDictionaryRef dict = (CFDictionaryRef)CFArrayGetValueAtIndex(array, i);
    auto str = CFStringToString((CFStringRef)CFDictionaryGetValue(dict, kCGWindowOwnerName));
    if (str == name)
    {
      CFNumberRef ownerPidRef = (CFNumberRef)CFDictionaryGetValue(dict, kCGWindowOwnerPID);
      pid_t ownerPid;
      CFNumberGetValue(ownerPidRef, kCFNumberSInt32Type, &ownerPid);
      CFRelease(array);
      return ownerPid;
    }
  }
  CFRelease(array);
  return -1;
}

AXUIElementRef findAXUIElementByName(std::string name)
{
  if (!appDataByProcessName.count(name))
  {
    auto pid = GetPID(name);
    if (pid == -1)
    {
      return NULL;
    }
    auto ref = AXUIElementCreateApplication(pid);
    if (ref != NULL)
    {
      addProcessId(pid);
      appDataByProcessName[name] = AppData({ref,
                                            pid});
    }
    return ref;
  }
  else
  {
    auto data = appDataByProcessName[name];
    if (!pidIsAlive(data.pid))
    {
      CFRelease(data.ref);
      removeProcessId(data.pid);
      appDataByProcessName.erase(name);
      // Try again
      return findAXUIElementByName(name);
    }
    return data.ref;
  }
}

AXUIElementRef GetBitwigAXUIElement()
{
  return findAXUIElementByName("Bitwig Studio");
}

Napi::Value AccessibilityEnabled(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  bool notify = info[0].As<Napi::Boolean>();
  auto dict = CFDictionaryCreate(NULL,
                                 (const void **)&kAXTrustedCheckOptionPrompt,
                                 (const void **)(notify ? &kCFBooleanTrue : &kCFBooleanFalse),
                                 1,
                                 &kCFTypeDictionaryKeyCallBacks,
                                 &kCFTypeDictionaryValueCallBacks);
  bool trusted = AXIsProcessTrustedWithOptions(dict);
  CFRelease(dict);

  return Napi::Boolean::New(
      env,
      trusted);
}

std::vector<AXUIElementRef> GetPluginAXUIElements()
{
  // Create a vector of AXUIElementRef objects
  std::vector<AXUIElementRef> elementRefs;

  // Iterate over array of strings
  for (auto &name : {"Bitwig Plug-in Host 64", "Bitwig Plug-in Host X64", "Bitwig Plug-in Host ARM64", "Bitwig Studio Engine", "Bitwig Audio Engine", "Bitwig Audio Engine X64", "Bitwig Audio Engine ARM64"})
  {
    // Get AXUIElementRef for name
    auto elementRef = findAXUIElementByName(name);
    if (elementRef != NULL)
    {
      // std::cout << "Found " << name << std::endl;
      elementRefs.push_back(elementRef);
    }
  }

  // std::cout << "Found " << elementRefs.size() << " plugin processes" << std::endl;
  return elementRefs;
}

Napi::Value GetPluginWindowsPosition(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::Object outObj = Napi::Object::New(env);
  int elementI = 0;

  for (auto &elementRef : GetPluginAXUIElements())
  {

    CFArrayRef windowArray = nil;
    // std::cout << "getpluginwindows ref i" << elementI << std::endl;
    AXUIElementCopyAttributeValue(elementRef, kAXWindowsAttribute, (CFTypeRef *)&windowArray);
    if (windowArray != nil)
    {
      CFIndex nItems = CFArrayGetCount(windowArray);
      for (int i = 0; i < nItems; i++)
      {
        // std::cout << "getpluginwindows window" << i << std::endl;
        AXUIElementRef itemRef = (AXUIElementRef)CFArrayGetValueAtIndex(windowArray, i);
        CFTypeRef position = nullptr;
        CFTypeRef size = nullptr;
        CGPoint positionPoint;
        CGSize sizePoint;
        CFStringRef titleRef = nullptr;
        CFBooleanRef isFocused = nullptr;
        bool focused = false;
        std::string windowTitle = "";

        if (AXUIElementCopyAttributeValue(itemRef, kAXPositionAttribute, (CFTypeRef *)&position) == kAXErrorSuccess)
        {
          AXValueGetValue((AXValueRef)position, (AXValueType)kAXValueCGPointType, &positionPoint);
          CFRelease(position);
        }
        else
        {
          continue;
        }

        if (AXUIElementCopyAttributeValue(itemRef, kAXSizeAttribute, (CFTypeRef *)&size) == kAXErrorSuccess)
        {
          AXValueGetValue((AXValueRef)size, (AXValueType)kAXValueCGSizeType, &sizePoint);
          CFRelease(size);
        }
        else
        {
          continue;
        }

        if (AXUIElementCopyAttributeValue(itemRef, kAXTitleAttribute, (CFTypeRef *)&titleRef) == kAXErrorSuccess)
        {
          windowTitle = CFStringToString((CFStringRef)titleRef);
          CFRelease(titleRef);
        }
        else
        {
          continue;
        }

        if (AXUIElementCopyAttributeValue(itemRef, kAXFocusedAttribute, (CFTypeRef *)&isFocused) == kAXErrorSuccess)
        {
          focused = isFocused == kCFBooleanTrue;
        }
        else
        {
          continue;
        }

        while (outObj.Has(windowTitle))
        {
          windowTitle = windowTitle + " (duplicate)";
        }

        auto obj = Napi::Object::New(env);
        obj.Set(Napi::String::New(env, "x"), Napi::Number::New(env, positionPoint.x));
        obj.Set(Napi::String::New(env, "y"), Napi::Number::New(env, positionPoint.y));
        obj.Set(Napi::String::New(env, "w"), Napi::Number::New(env, sizePoint.width));
        obj.Set(Napi::String::New(env, "h"), Napi::Number::New(env, sizePoint.height));
        obj.Set(Napi::String::New(env, "id"), Napi::String::New(env, windowTitle));
        obj.Set(Napi::String::New(env, "focused"), Napi::Boolean::New(env, isFocused == kCFBooleanTrue));
        outObj.Set(Napi::String::New(env, windowTitle), obj);
      }
      CFRelease(windowArray);
    }
  }

  return outObj;
}

Napi::Value GetPluginWindowsCount(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  int count = 0;

  for (auto &elementRef : GetPluginAXUIElements())
  {

    CFArrayRef windowArray = nil;
    AXUIElementCopyAttributeValue(elementRef, kAXWindowsAttribute, (CFTypeRef *)&windowArray);
    if (windowArray != nil)
    {
      count += CFArrayGetCount(windowArray);
      CFRelease(windowArray);
    }
  }
  return Napi::Number::New(env, 0);
}

Napi::Value SetPluginWindowsPosition(const Napi::CallbackInfo &info)
{
  auto inObject = info[0].As<Napi::Object>();
  int j = 0;
  std::set<std::string> windowTitles;

  for (auto &elementRef : GetPluginAXUIElements())
  {
    j++;
    CFArrayRef windowArray = nil;
    AXUIElementCopyAttributeValue(elementRef, kAXWindowsAttribute, (CFTypeRef *)&windowArray);
    // std::cout << "Element ref for " << j << std::endl;
    if (windowArray != nil)
    {
      // std::cout << "Window array is not nil" << std::endl;
      CFIndex nItems = CFArrayGetCount(windowArray);
      for (int i = 0; i < nItems; i++)
      {
        // std::cout << "Item " << i << std::endl;
        AXUIElementRef itemRef = (AXUIElementRef)CFArrayGetValueAtIndex(windowArray, i);
        std::string windowTitle = "";
        CFStringRef titleRef = nullptr;

        // Try to get the window title
        if (AXUIElementCopyAttributeValue(itemRef, kAXTitleAttribute, (CFTypeRef *)&titleRef) == kAXErrorSuccess)
        {
          windowTitle = CFStringToString((CFStringRef)titleRef);
          CFRelease(titleRef);

          if (windowTitles.find(windowTitle) == windowTitles.end())
          {
            // Add to set if doesn't exist
            windowTitles.insert(windowTitle);
          }
          else
          {
            // Otherwise if the window title has already come up, add (duplicate) to match the `getPluginWindowsPosition` API
            do
            {
              windowTitle = windowTitle + " (duplicate)";
            } while (windowTitles.find(windowTitle) != windowTitles.end());
          }
        }
        // If we can't, we don't know which window it is so we have to skip
        else
        {
          continue;
        }

        // If this plugin window wasn't specified, warn the user, may not be intended
        if (!inObject.Has(windowTitle))
        {
          std::cerr << "Window title " << windowTitle << " not found in object" << std::endl;
          continue;
        }

        auto posForWindow = inObject.Get(windowTitle).As<Napi::Object>();
        CGPoint newPoint;
        newPoint.x = posForWindow.Get("x").As<Napi::Number>();
        newPoint.y = posForWindow.Get("y").As<Napi::Number>();

        auto position = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGPointType, (const void *)&newPoint));
        AXUIElementSetAttributeValue(itemRef, kAXPositionAttribute, position);
        CFRelease(position);
      }
      CFRelease(windowArray);
    }
  }
  return Napi::Value();
}

Napi::Value FocusPluginWindow(const Napi::CallbackInfo &info)
{
  std::string id = info[0].As<Napi::String>();
  for (auto &elementRef : GetPluginAXUIElements())
  {
    CFArrayRef windowArray = nil;
    AXUIElementCopyAttributeValue(elementRef, kAXWindowsAttribute, (CFTypeRef *)&windowArray);
    if (windowArray != nil)
    {
      CFIndex nItems = CFArrayGetCount(windowArray);
      for (int i = 0; i < nItems; i++)
      {
        AXUIElementRef itemRef = (AXUIElementRef)CFArrayGetValueAtIndex(windowArray, i);
        CFStringRef titleRef;
        std::string windowTitle = "";
        if (AXUIElementCopyAttributeValue(itemRef, kAXTitleAttribute, (CFTypeRef *)&titleRef) == kAXErrorSuccess)
        {
          windowTitle = CFStringToString((CFStringRef)titleRef);
          CFRelease(titleRef);
        }
        else
        {
          continue;
        }

        if (id == windowTitle)
        {
          AXUIElementSetAttributeValue(elementRef, kAXFrontmostAttribute, kCFBooleanTrue);
          AXUIElementSetAttributeValue(itemRef, kAXMainAttribute, kCFBooleanTrue);
          break;
        }
      }
      CFRelease(windowArray);
    }
  }

  return Napi::Value();
}

void closeWindowsForAXUIElement(AXUIElementRef elementRef)
{
  if (elementRef != NULL)
  {
    CFArrayRef windowArray = nil;
    AXUIElementCopyAttributeValue(elementRef, kAXWindowsAttribute, (CFTypeRef *)&windowArray);
    if (windowArray != nil)
    {
      CFIndex nItems = CFArrayGetCount(windowArray);
      for (int i = 0; i < nItems; i++)
      {
        AXUIElementRef itemRef = (AXUIElementRef)CFArrayGetValueAtIndex(windowArray, i);
        AXUIElementRef buttonRef = nil;

        AXUIElementCopyAttributeValue(itemRef, kAXCloseButtonAttribute, (CFTypeRef *)&buttonRef);
        AXUIElementPerformAction(buttonRef, kAXPressAction);
        CFRelease(buttonRef);
      }

      CFRelease(windowArray);
    }
  }
}

bool isAXUIElementActiveApp(AXUIElementRef element)
{
  if (!element)
  {
    return false;
  }
  CFBooleanRef isFrontmost;
  AXUIElementCopyAttributeValue(element, kAXFrontmostAttribute, (CFTypeRef *)&isFrontmost);
  bool is = isFrontmost == kCFBooleanTrue;
  return is;
}

bool isAppActive(std::string app)
{
  if (!activeAppDirty)
  {
    return activeApp == app;
  }
  auto axUIEl = findAXUIElementByName(app);
  auto active = isAXUIElementActiveApp(axUIEl);
  if (active)
  {
    activeApp = app;
  }
  return active;
}

bool isBitwigActive()
{
  return isAXUIElementActiveApp(GetBitwigAXUIElement());
}

bool isPluginWindowActive()
{
  for (auto &elementRef : GetPluginAXUIElements())
  {
    if (isAXUIElementActiveApp(elementRef))
    {
      return true;
    }
  }
  return false;
}

bool shouldProcessEventForProcessId(pid_t pid)
{
  // shared lock guard
  std::shared_lock<std::shared_mutex> lock(processIdsMutex);
  return processIds.find(pid) != processIds.end();
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
  auto uiEl = GetBitwigAXUIElement();
  auto success = false;
  if (uiEl != NULL)
  {
    AXUIElementSetAttributeValue(uiEl, kAXFrontmostAttribute, kCFBooleanTrue);
    success = true;
  }
  return Napi::Boolean::New(
      env,
      success);
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
  for (auto &elementRef : GetPluginAXUIElements())
  {
    closeWindowsForAXUIElement(elementRef);
  }
  return Napi::Boolean::New(env, true);
}

Napi::Value GetPid(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (appDataByProcessName.count("Bitwig Studio") == 1)
  {
    return Napi::Number::New(env, appDataByProcessName["Bitwig Studio"].pid);
  }
  return Napi::Number::New(env, -1);
}

void InitBitwigOS(Napi::Env env, Napi::Object exports)
{
}
