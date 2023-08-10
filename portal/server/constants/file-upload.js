const FILE_UPLOAD = {
  DOCUMENT_TYPES: [
    'exporterQuestionnaire',
    'auditedFinancialStatements',
    'yearToDateManagement',
    'financialForecasts',
    'financialInformationCommentary',
    'corporateStructure',
  ],
  ALLOWED_FORMATS: ['bmp', 'doc', 'docx', 'gif', 'jpeg', 'jpg', 'pdf', 'png', 'ppt', 'pptx', 'tif', 'txt', 'xls', 'xlsx'],
  MAX_FILE_SIZE: 12 * 1024 * 1024, // 12mb
};

module.exports = {
  FILE_UPLOAD,
};
