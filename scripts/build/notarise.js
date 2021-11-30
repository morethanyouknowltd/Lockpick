require('dotenv').config()
const { notarize } = require('electron-notarize')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  console.log('we are here')
  const env = process.env
  const appName = context.packager.appInfo.productFilename

  // We notarise differently depending on whether running locally or
  // Github actions. Either are fine
  const opts = env.API_KEY
    ? {
        appleApiKey: env.API_KEY,
        appleApiKeyId: env.API_KEY_ID,
        appleApiIssuer: env.API_KEY_ISSUER_ID,
      }
    : {
        appleId: env.APPLEID,
        appleIdPassword: env.APPLEIDPASS,
      }

  return await notarize({
    appBundleId: 'co.uk.morethanyouknow.lockpick',
    appPath: `${appOutDir}/${appName}.app`,
    ...opts,
  })
}
