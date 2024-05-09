const FILE_UPLOAD = {
  ALLOWED_FORMATS: ['.bmp', '.doc', '.docx', '.gif', '.jpeg', '.jpg', '.pdf', '.png', '.ppt', '.pptx', '.tif', '.txt', '.xls', '.xlsx'],
  ALLOWED_FORMATS_UTILISATION_REPORT: ['.csv'],
  MAX_FILE_SIZE: 12 * 1024 * 1024, // 12mb
  MAX_FILE_SIZE_IN_MB: 12,
};

const FILESHARES = {
  PORTAL: 'portal',
  WORKFLOW: 'workflow',
  UTILISATION_REPORTS: 'utilisationReports',
};

module.exports = {
  FILE_UPLOAD,
  FILESHARES,
};
