/* global app */

var Client = require('ftp')
var c = new Client()

function uploadFile (localFile, remoteFile) {
  console.log(`[ftp] process upload: ${localFile}`)

  var self = this

  return new Promise(function (resolve, reject) {
    c.put(localFile, remoteFile, function (err) {
      if (err) {
        reject(err)
        throw err
      }

      console.log(`[ftp] uploaded: ${localFile}`)

      return resolve(self)
    })
  })
}

function uploadFiles () {
  console.log('[ftp] client ready')

  uploadFile(`bin/crx/${app.crxFileName}`, `${app.crxRemoteDirectory}/crx/${app.crxFileName}`)
    .then(function () {
      return uploadFile('bin/update.xml', `${app.crxRemoteDirectory}/update.xml`)
    })
    .then(function () {
      console.log('[ftp] closing channel')
      c.end()
    })
}

module.exports = function () {
  console.log('[ftp] upload')

  c.on('ready', uploadFiles)

  c.connect({
    host: process.env.ftpHost,
    port: process.env.ftpPort,
    user: process.env.ftpUser,
    password: process.env.ftpPass,
    connTimeout: 30000,
    pasvTimeout: 30000
  })
}
