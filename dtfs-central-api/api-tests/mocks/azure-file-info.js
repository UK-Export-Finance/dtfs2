const MOCK_FILE_INFO = {
  folder: 'folder_name',
  filename: 'test_file.csv',
  fullPath: 'folder_name/test_file.csv',
  url: 'https://azure/utilisation-reports/folder_name/test_file.csv',
};

const MOCK_AZURE_FILE_INFO = {
  ...MOCK_FILE_INFO,
  mimetype: 'text/csv',
};

module.exports = {
  MOCK_FILE_INFO,
  MOCK_AZURE_FILE_INFO,
};
