const path = require('path')
const FOR_REAL = process.env.FOR_REAL === 'true'
const disableCodeSign = false
const fs = require('fs')
const modsFolder = path.join(__dirname, 'extra-resources', 'default-mods')
const disabledMods = fs.readdirSync(modsFolder).filter(file => {
  return fs.readFileSync(path.join(modsFolder, file)).toString().indexOf('@disabled') >= 0
})

module.exports = {
  appId: 'co.uk.morethanyouknow.lockpick',
  productName: 'Lockpick',
  copyright: 'More Than You Know Ltd.',
  directories: {
    output: 'out',
    buildResources: 'build-resources',
  },
  files: [
    '{package.json,node_modules,dist,extra-resources}/**/*',
    `!extra-resources/default-mods/{${disabledMods.join(',')}}`,
    'build/Release/bes.node',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.env,.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
  ],
  npmRebuild: process.env.SKIP_REBUILD !== 'true',
  dmg: {
    background: null,
    backgroundColor: '#ffffff',
    window: {
      width: '400',
      height: '300',
    },
    contents: [
      {
        x: 100,
        y: 100,
      },
      {
        x: 300,
        y: 100,
        type: 'link',
        path: '/Applications',
      },
    ],
  },
  afterPack: path.join(__dirname, 'scripts', 'build', 'afterPack.js'),
  ...(FOR_REAL
    ? {
        asar: true,
        afterSign: path.join(__dirname, 'scripts', 'build', 'notarise.js'),
      }
    : {
        asar: false,
      }),
  mac: {
    target: 'dmg',
    asarUnpack: ['**/*.node'],
    category: 'public.app-category.utilities',
    ...(disableCodeSign
      ? { identity: null }
      : {
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: path.join(__dirname, 'scripts', 'build', 'entitlements.mac.plist'),
          entitlementsInherit: path.join(__dirname, 'scripts', 'build', 'entitlements.mac.plist'),
        }),
  },
}
