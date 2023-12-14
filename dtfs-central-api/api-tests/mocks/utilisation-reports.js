const MOCK_BANKS = require('./banks');
const { MOCK_AZURE_FILE_INFO } = require('./azure-file-info');

const MOCK_UTILISATION_REPORT = {
  bank: {
    id: MOCK_BANKS.HSBC.id,
    name: MOCK_BANKS.HSBC.name,
  },
  month: 11,
  year: 2023,
  dateUploaded: new Date('2023-11-15').toISOString(),
  azureFileInfo: MOCK_AZURE_FILE_INFO,
  uploadedBy: {
    id: '5099803df3f4948bd2f98391',
    firstname: 'test',
    surname: 'user',
  },
};

module.exports = { MOCK_UTILISATION_REPORT };
