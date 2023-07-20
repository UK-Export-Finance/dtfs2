const FILE_UPLOAD = {
  ALLOWED_FORMATS: ['bmp', 'doc', 'docx', 'gif', 'jpeg', 'jpg', 'pdf', 'png', 'ppt', 'pptx', 'tif', 'txt', 'xls', 'xlsx'],
  MAX_FILE_SIZE: 12 * 1024 * 1024, // 12mb
  MAX_FILE_SIZE_MB: 12,
};

module.exports = {
  FILE_UPLOAD,
};
