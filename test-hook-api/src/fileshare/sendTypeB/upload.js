const moment = require('moment');
const driver = require('../driver');

const upload = async({fileshare, folder, typeBXML}) => {
  const filename = `${moment().format('YYYY_MM_DD_hh_mm_ss')}.XML`;

  const opts = {
    fileshare,
    folder,
    filename,
    buffer: Buffer.from(`\ufeff${typeBXML}`, 'utf16le'),
    allowOverwrite: true,
  };

  await driver.uploadFile(opts);

  return filename;
}

module.exports = upload;
