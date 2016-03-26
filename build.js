require('dotenv').config({silent: true})
require('./build/app').load()

var createCrx = require('./build/createCrx.js')
var uploadViaFTP = require('./build/uploadViaFTP')

createCrx()
  .then(uploadViaFTP)
