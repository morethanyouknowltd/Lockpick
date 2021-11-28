#!/usr/bin/env node

const windows = require('os').platform() === 'win32'
const execSync = require('child_process').execSync

const passthrough = cmd => {
  console.log(cmd)
  execSync(cmd, { stdio: 'inherit' })
}

if (windows) {
  try {
    passthrough('taskkill /f /im "vsdbg.exe"')
  } catch (e) {}

  console.log('msbuild')
  passthrough('MSBuild.exe ./src/connector/native/HookDll/HookDll.sln"')
}

passthrough('node-gyp -j 16 build --debug')
