const fs = require('fs');

module.exports = async (filepath) => {

  return new Promise( (resolve, reject) => {
    fs.readdir(filepath,  async (err, files) => {
        if (err) reject (err);

        resolve(
          files.map( file => `${filepath}/${file}`)
        );
    });
  });

}
