#!/bin/bash

killall Lockpick
yarn buildc
cp -rf ./build/Release /Applications/Lockpick.app/Contents/Resources/app/build/.
/Applications/Lockpick.app/Contents/MacOS/Lockpick