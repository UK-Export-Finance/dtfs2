const DEFAULT_ALLOWED_FORMATS = ['bmp', 'doc', 'docx', 'gif', 'jpeg', 'jpg', 'pdf', 'png', 'ppt', 'pptx', 'tif', 'txt', 'xls', 'xlsx'];

// format file from bytes to MB/KB, etc
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const multerFilter = (req, file, cb) => {
  const defaultFileSize = 12582912; // == 12mb

  if (file.originalname.match(new RegExp(`\\.(${DEFAULT_ALLOWED_FORMATS.join('|')})$`))) {
    cb(null, true);
  } else {
    cb({
      message: `${file.originalname} must be a ${DEFAULT_ALLOWED_FORMATS.join(', ').toUpperCase()}`,
      file,
    }, false);
  }
};

module.exports = { multerFilter, formatBytes };
