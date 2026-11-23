const { FILE_UPLOAD } = require('../constants/file-upload');
// format file from bytes to MB/KB, etc
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) {
    return '0 Bytes';
  }

  const kilobytes = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const calculation = Math.floor(Math.log(bytes) / Math.log(kilobytes));

  return `${parseFloat((bytes / kilobytes ** calculation).toFixed(dm))} ${sizes[calculation]}`;
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

module.exports = { multerFilter, formatBytes };
