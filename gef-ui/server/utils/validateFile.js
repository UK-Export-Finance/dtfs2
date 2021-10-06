const DEFAULT_MAX_SIZE = 1024 * 1024 * 10;
const DEFAULT_ALLOWED_FORMATS = ['bmp', 'doc', 'docx', 'gif', 'jpeg', 'jpg', 'msg', 'pdf', 'png', 'ppt', 'pptx', 'tif', 'txt', 'xls', 'xlsx', 'zip'];

/**
 * Validates file's for size and format
 *
 * @param {*} file file to validate. Expects format from multer upload
 * @param {Number} maxSize (optional) maximum allowed size for file, defaults to 10mb. Sizes are in bytes
 * @param {Array} allowedFormats (optional) array of file extensions to allow
 * @returns [isValid, error]
 */
const validateFile = (
  { originalname, size } = {},
  maxSize = DEFAULT_MAX_SIZE,
  allowedFormats = DEFAULT_ALLOWED_FORMATS,
) => {
  if (!originalname || !size) return [false, 'Invalid file'];

  if (!originalname.match(new RegExp(`\\.(${allowedFormats.join('|')})$`))) {
    return [false, `${originalname} must be a ${allowedFormats.slice(0, -1).join(', ').toUpperCase()} or ${allowedFormats[allowedFormats.length - 1].toUpperCase()}`];
  }

  if (size > maxSize) return [false, `${originalname} must be smaller than ${Math.round(maxSize / (1024 * 1024))}MB`];

  return [true, null];
};

module.exports = validateFile;
