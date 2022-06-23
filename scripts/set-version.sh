#!/bin/bash

perl -pi -e "s/LOCKPICK_VERSION = '[^']+'/LOCKPICK_VERSION = '$1'/g" ./src/connector/shared/constants.ts
