const multer = require('multer');

// TODO: cleanup file upload: https://ukef-dtfs.atlassian.net/browse/DTFS2-4956
const fileUpload = multer({ dest: 'temp/' });

module.exports = fileUpload;
