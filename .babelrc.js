const MTYKTransform = require('@mtyk/frontend/babel')

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          electron: '16',
        },
      },
    ],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
    '@babel/preset-react',
  ],
  plugins: [
    MTYKTransform({ environment: 'browser' }),
    ['styled-components', { ssr: true }],
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
  ],
}
