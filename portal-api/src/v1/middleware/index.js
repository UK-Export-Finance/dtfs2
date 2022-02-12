const cleanXss = require('./clean-xss');
const fileUpload = require('./file-upload.middleware');
const validateBank = require('./validate-bank.middleware');

module.exports = {
  cleanXss,
  fileUpload,
  validateBank
};
