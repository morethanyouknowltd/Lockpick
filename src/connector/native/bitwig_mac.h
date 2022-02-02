
#pragma once
#include <vector>
#include <ApplicationServices/ApplicationServices.h>

bool shouldProcessEventForProcessId(pid_t pid);
std::string subroleForWindow(AXUIElementRef windowRef);
