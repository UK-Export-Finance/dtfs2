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
  ALLOWED_FORMATS_UTILISATION_REPORT: ['xlsx', 'csv'],
  ALLOWED_MIMETYPES_UTILISATION_REPORT: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'],
  FILENAME_SUBMITTED_INDICATOR: 'SUBMITTED',
  MAX_FILE_SIZE: 12 * 1024 * 1024, // 12mb
  MAX_CELL_CHARACTER_COUNT: 15,
};

module.exports = {
  FILE_UPLOAD,
};
