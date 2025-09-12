const multer = require('multer');
const path = require('path');
const { FILE_UPLOAD } = require('../../constants');

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname);
  const allowed = FILE_UPLOAD.ALLOWED_FORMATS_UTILISATION_REPORT.includes(fileExtension);

  if (!allowed) {
    const fileError = {
      field: file.fieldname,
      originalname: file.originalname,
      message: 'file type is not allowed',
    };

    req.filesNotAllowed = req.filesNotAllowed ? req.filesNotAllowed.concat(fileError) : [fileError];
  }

  cb(null, allowed);
};

const utilisationReportFileUpload = multer({ fileFilter, limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE } }).single('csvFile');

module.exports = { utilisationReportFileUpload };
