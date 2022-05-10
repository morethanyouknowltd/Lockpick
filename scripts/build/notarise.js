require('dotenv').config()
const { notarize } = require('electron-notarize')
const os = require('os')
const path = require('path')

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const env = process.env
  const appName = context.packager.appInfo.productFilename
  return await notarize({
    tool: 'notarytool',
    appleApiKeyId: env.API_KEY_ID,
    appleApiIssuer: env.API_KEY_ISSUER_ID,
    appleApiKey: path.join(os.homedir(), `/private_keys/AuthKey_${env.API_KEY_ID}.p8`),
    appBundleId: 'co.uk.morethanyouknow.lockpick',
    appPath: `${appOutDir}/${appName}.app`,
  })
}
