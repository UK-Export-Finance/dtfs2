const { MOCK_AZURE_FILE_INFO } = require('./mock-azure-file-info');

const MOCK_UTILISATION_REPORT = {
  bank: {
    id: '123',
    name: 'test bank',
  },
  month: 1,
  year: 2021,
  dateUploaded: new Date('2021-02-07'),
  azureFileInfo: MOCK_AZURE_FILE_INFO,
  uploadedBy: {
    id: '123',
    firstname: 'test',
    surname: 'user',
  },
};

module.exports = MOCK_UTILISATION_REPORT;
