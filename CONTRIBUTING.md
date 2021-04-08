## Contributing

Feel free to fork and pull request with any fixes. If you're looking for any guidance with the codebase or would like to discuss a new feature free to ask any questions on the [discord](https://discord.gg/6Wetp3ZsKv).

## App Setup

1. Run `npm i` to install dependencies
2. Open 4 terminals 🤖
    - `npm run dev` to run Webpack Dev Server for renderer process
    - `npm run watch` to autocompile Typescript for main process
    - `npm run start` to start Electron (and restart on changes)
    - `npm run watch:controller` to autocompile Typescript for the controller script (Optional)

## Env variables

- DEBUG - "true" to enable in depth logging
- DEBUG_ASYNC - "true" to log async calls (setTimeout etc...) from Bitwig controller script
- NODE_ENV - should always be 'dev' when running in development
- QUIET_START - "true" to stop Preferences from opening on startup
