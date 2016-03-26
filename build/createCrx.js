var request = require('request')
var fs = require('fs')
var mkdirp = require('mkdirp')
var ChromeExtension = require('crx')
var join = require('path').join

var pkg = require(join(process.cwd(), 'package.json'))

function generateCrx (pemKey) {
  var crxFileName = `${pkg.name}-v${pkg.version}.crx`

  var crx = new ChromeExtension({
    codebase: `${process.env.crxServer}/crx/${crxFileName}`,
    privateKey: pemKey
  })

  return crx.load(join(process.cwd(), 'dist'))
    .then(function () {
      return crx.pack().then(function (crxBuffer) {
        var updateXML = crx.generateUpdateXML()

        mkdirp.sync(join(process.cwd(), 'bin/crx'))
        fs.writeFileSync(join(process.cwd(), 'bin/update.xml'), updateXML)
        fs.writeFileSync(join(process.cwd(), 'bin/crx/', crxFileName), crxBuffer)

        console.log(`written file: ${crxFileName}`)
      })
    })
}

module.exports = function () {
  var self = this

  return new Promise(function (resolve, reject) {
    request.get(`${process.env.crxServer}/${process.env.crxPemFile}`, function (error, response, body) {
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
