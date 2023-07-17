const DEFAULT_ALLOWED_FORMATS = ['bmp', 'doc', 'docx', 'gif', 'jpeg', 'jpg', 'msg', 'pdf', 'png', 'ppt', 'pptx', 'tif', 'txt', 'xls', 'xlsx', 'zip'];

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
  const { documentType } = req.params;

  const manualInclusionFileSize = 12582912; // == 12mb
  const defaultFileSize = 10485760; // == 10mb
  const maxFileSize = documentType === 'manual-inclusion-questionnaire' ? manualInclusionFileSize : defaultFileSize;
  const fileSize = parseInt(req.headers['content-length'], 10);

  if (file.originalname.match(new RegExp(`\\.(${DEFAULT_ALLOWED_FORMATS.join('|')})$`))) {
    // if the document type is manual inclusion, then the max file size is 12mb
    if (fileSize <= maxFileSize) {
      cb(null, true);
    } else {
      cb({
        message: `${file.originalname} must be smaller than ${formatBytes(maxFileSize)}`,
      }, false);
    }
  } else {
    cb({
      message: `${file.originalname} must be a ${DEFAULT_ALLOWED_FORMATS.join(', ').toUpperCase()}`,
      file,
    }, false);
  }
};

module.exports = { multerFilter, formatBytes };
