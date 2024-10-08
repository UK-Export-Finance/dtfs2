const filesize = require('filesize');

const DEFAULT_MAX_SIZE = 10; // 10mb
const DEFAULT_UNITS = ['KiB', 'B', 'kbit'];
const DEFAULT_ALLOWED_FORMATS = ['bmp', 'doc', 'docx', 'gif', 'jpeg', 'jpg', 'pdf', 'png', 'ppt', 'pptx', 'tif', 'txt', 'xls', 'xlsx'];
/**
 * Validates file's for size and format
 *
 * @param {*} file file to validate. Expects format from multer upload
 * @param {number} maxSize (optional) maximum allowed size for file, defaults to 10mb. Sizes are in bytes
 * @param {Array} allowedFormats (optional) array of file extensions to allow
 * @returns [isValid, error]
 */
const validateFile = ({ originalname, size } = {}, maxSize = DEFAULT_MAX_SIZE, allowedFormats = DEFAULT_ALLOWED_FORMATS) => {
  if (!originalname || !size) return [false, 'Invalid file'];

  if (!originalname.match(new RegExp(`\\.(${allowedFormats.join('|')})$`))) {
    return [
      false,
      `${originalname} must be a ${allowedFormats.slice(0, -1).join(', ').toUpperCase()} or ${allowedFormats[allowedFormats.length - 1].toUpperCase()}`,
    ];
  }

  const { value: currentFileSize, unit } = filesize(size, { base: 2, output: 'object' });

  if (DEFAULT_UNITS.includes(unit) || (unit === 'MiB' && currentFileSize <= maxSize)) {
    return [true, null];
  }
  return [false, `${originalname} must be smaller than ${maxSize}MB`];
};

module.exports = validateFile;
