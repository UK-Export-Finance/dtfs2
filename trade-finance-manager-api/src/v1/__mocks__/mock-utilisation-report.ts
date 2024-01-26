import { UtilisationReportResponseBody } from '../../types/utilisation-reports';

const MOCK_AZURE_FILE_INFO = {
  folder: 'folder_name',
  filename: 'test_file.csv',
  fullPath: 'folder_name/test_file.csv',
  url: 'https://azure/utilisation-reports/folder_name/test_file.csv',
  mimetype: 'text/csv',
};

export const MOCK_UTILISATION_REPORT: UtilisationReportResponseBody = {
  _id: '65646e1d1621576fd7a6bc9a',
  bank: {
    id: '987',
    name: 'Bank name',
  },
  month: 11,
  year: 2023,
  dateUploaded: '2023-11-15T15:11:14Z',
  azureFileInfo: MOCK_AZURE_FILE_INFO,
  status: 'PENDING_RECONCILIATION',
  uploadedBy: {
    id: '5099803df3f4948bd2f98391',
    firstname: 'test',
    surname: 'user',
  },
};
