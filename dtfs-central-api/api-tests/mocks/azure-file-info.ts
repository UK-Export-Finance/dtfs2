import { AzureFileInfo } from '../../src/types/azure-file-info';

export const MOCK_FILE_INFO = {
  folder: 'folder_name',
  filename: 'test_file.csv',
  fullPath: 'folder_name/test_file.csv',
  url: 'https://azure/utilisation-reports/folder_name/test_file.csv',
};

export const MOCK_AZURE_FILE_INFO: AzureFileInfo = {
  ...MOCK_FILE_INFO,
  mimetype: 'text/csv',
};
