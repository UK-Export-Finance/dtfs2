const { FILE_UPLOAD } = require('../constants/file-upload');

// format file from bytes to MB/KB, etc
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const multerFilter = (req, file, cb) => {
  const allowedFormatsRegex = new RegExp(`\\.(${FILE_UPLOAD.ALLOWED_FORMATS.join('|')})$`);
  if (file.originalname.match(allowedFormatsRegex)) {
    cb(null, true);
  } else {
    cb(
      {
        message: `${file.originalname} must be a ${FILE_UPLOAD.ALLOWED_FORMATS.join(', ').toUpperCase()}`,
        file,
      },
      false,
    );
  }
};

const utilisationReportMulterFilter = (req, file, cb) => {
  const allowedFormatsRegex = new RegExp(`\\.(${FILE_UPLOAD.ALLOWED_FORMATS_UTILISATION_REPORT.join('|')})$`);
  if (file.originalname.match(allowedFormatsRegex) && FILE_UPLOAD.ALLOWED_MIMETYPES_UTILISATION_REPORT.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      {
        message: `${file.originalname} must be a ${FILE_UPLOAD.ALLOWED_FORMATS_UTILISATION_REPORT.join(', ').toUpperCase()}`,
        file,
      },
      false,
    );
  }
};

module.exports = { multerFilter, formatBytes, utilisationReportMulterFilter };
