const multer = require('multer');
const { FILE_UPLOAD } = require('../../constants');

const fileFilter = (req, file, cb) => {
  const fileExtension = file.originalname.match(/\.[^.]*$/g);
  const allowed = FILE_UPLOAD.ALLOWED_FORMATS_UTILISATION_REPORT.includes(fileExtension[0]);

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

const utilisationReportFileUpload = multer({ fileFilter, limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE, files: 20 } }).single('csvFile');

module.exports = { utilisationReportFileUpload };
