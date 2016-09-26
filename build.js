var fstream = require('fstream'),
    tar = require('tar'),
    zlib = require('zlib');

fstream.Reader('release/') /* Read the source directory */
.pipe(tar.Pack()) /* Convert the directory to a .tar file */
.pipe(zlib.Gzip()) /* Compress the .tar file */
.pipe(fstream.Writer({ 'path': 'release.tar.gz' })); /* Give the output file name */
