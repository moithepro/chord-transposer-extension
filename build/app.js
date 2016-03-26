var join = require('path').join
var pkg = require(join(process.cwd(), 'package.json'))

module.exports = {
  load: function () {
    global.app = {
      crxRemoteHost: process.env.crxRemoteHost,
      crxRemoteDirectory: process.env.crxRemoteDirectory,
      crxFileName: `${pkg.name}-v${pkg.version}.crx`,
      crxPemFile: process.env.crxPemFile
    }
  }
}
