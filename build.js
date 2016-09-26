var fstream = require('fstream')
var tar = require('tar')
var zlib = require('zlib')

fstream.Reader('release/')
  .pipe(tar.Pack())
  .pipe(zlib.Gzip())
  .pipe(fstream.Writer({
    'path': 'release.tar.gz'
  }))
