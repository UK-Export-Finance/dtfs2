const multer = require('multer');
const { FILE_UPLOAD } = require('../../../constants/file-upload');

const fileFilter = (req, file, cb) => {
  const fileExtension = file.originalname.match(/\.[^.]*$/g);

  const allowed = FILE_UPLOAD.ALLOWED_FORMATS.includes(fileExtension[0]);

  if (!allowed) {
    const fileError = {
      field: file.fieldname,
      originalname: file.originalname,
      message: 'file type is not allowed',
    };

    req.filesNotAllowed = req.filesNotAllowed ? req.filesNotAllowed.push(fileError) : [fileError];
  }

  cb(null, allowed);
};

const fileUpload = multer({ fileFilter, limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE } }).any();

module.exports = fileUpload;
