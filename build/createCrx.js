/*global app*/

var request = require('request')
var fs = require('fs')
var mkdirp = require('mkdirp')
var ChromeExtension = require('crx')
var join = require('path').join

function generateCrx (pemKey) {
  var crx = new ChromeExtension({
    codebase: `${app.crxRemoteHost}/${app.crxRemoteDirectory}/crx/${app.crxFileName}`,
    privateKey: pemKey
  })

  console.log('[crx] generating files')

  return crx.load(join(process.cwd(), 'dist'))
    .then(function () {
      return crx.pack().then(function (crxBuffer) {
        var updateXML = crx.generateUpdateXML()

        mkdirp.sync(join(process.cwd(), 'bin/crx'))
        fs.writeFileSync(join(process.cwd(), 'bin/update.xml'), updateXML)
        fs.writeFileSync(join(process.cwd(), 'bin/crx/', app.crxFileName), crxBuffer)

        console.log(`[crx] written file: ${app.crxFileName}`)
      })
    })
}

module.exports = function () {
  var self = this

  return new Promise(function (resolve, reject) {
    console.log('[crx] fetcing key:')
    request.get(`${app.crxPemFile}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        return generateCrx(body)
          .then(function () {
            resolve(self)
          })
      } else {
        return reject(error || response.statusCode)
      }
    })
  })
}
