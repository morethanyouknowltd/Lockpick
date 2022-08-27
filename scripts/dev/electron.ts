import { spawn, execSync } from 'child_process'
import nodemon from 'nodemon'

function spawnWithPrefixLog(command: string, args: string[], prefix: string) {
  console.log(`${prefix} ${command} ${args.join(' ')}`)
  return spawn(command, args, {
    stdio: 'inherit',
  })
}

// Build c code first
execSync('npm run buildc:dev', {
  stdio: 'inherit',
})

spawnWithPrefixLog('yarn', `exec tsc -w --p ./src/main/tsconfig.json`.split(' '), 'Typescript')

nodemon({
  exec: 'electron --inspect=5858 ./dist/main/main.js',
  watch: `./dist`,
  env: {
    ...process.env,
    DEV_SERVER: 'true',
    NODE_OPTIONS: '--preserve-symlinks',
    NODE_ENV: 'dev',
  },
})

nodemon
  .on('start', function () {
    console.log('App has started')
  })
  .on('quit', function () {
    console.log('App has quit')
    process.exit()
  })
  .on('restart', function (files) {
    console.log('App restarted due to: ', files)
  })
