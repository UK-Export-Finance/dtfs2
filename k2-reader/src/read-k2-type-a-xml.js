const AutoDetectDecoderStream = require('autodetect-decoder-stream');
const fs = require('fs');

module.exports = async (file) => {
  return new Promise( (resolve, reject) => {
    // the provided examples were in an fileformat that node doesn't natively understand
    // (looks like it had a Byte Order Mark /BOM at the start of the file indicating some odd little-endian flavour of utf8)
    // this file-stream-processing business meant that i didn't have to understand the fileformat to use it..
    let result= "";

    fs.createReadStream(file)
      .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' }))
      .on('data', data => {
        result += data;
      })
      .on('end', () => {
        resolve(result);
      });

  });
}
