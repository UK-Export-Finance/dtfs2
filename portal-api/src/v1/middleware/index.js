const cleanXss = require('./clean-xss.middleware');
const fileUpload = require('./file-upload.middleware');

module.exports = { cleanXss, fileUpload };
