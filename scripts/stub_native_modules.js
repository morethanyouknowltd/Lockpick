const fs = require('fs')
const path = require('path')

for (const module of [
  'react-native',
  '@fortawesome/react-native-fontawesome',
  'react-router-native',
  'react-native-svg',
  'react-native-reanimated',
]) {
  const folderpath = path.join(__dirname, '..', 'node_modules', module)
  // Check if folder exists already

  if (!fs.existsSync(folderpath)) {
    fs.mkdirSync(folderpath)
  }
  fs.writeFileSync(path.join(folderpath, 'index.js'), 'module.exports = {}')
}
