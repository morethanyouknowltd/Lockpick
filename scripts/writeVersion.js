const fs = require('fs')
const package = require('../package.json')
package.version = process.argv[2]
fs.writeFileSync('./package.json', JSON.stringify(package, null, 2))