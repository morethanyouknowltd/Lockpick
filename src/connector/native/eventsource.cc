#include "eventsource.h"

CGEventSourceRef eventSource = CGEventSourceCreate(kCGEventSourceStatePrivate);
CGEventSourceRef getCGEventSource(bool lockpickListeners) {
    CGEventSourceSetUserData(eventSource, lockpickListeners ? 41 : 42);
    return eventSource;
}