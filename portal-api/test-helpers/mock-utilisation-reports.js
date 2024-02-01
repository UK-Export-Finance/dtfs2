const { MOCK_AZURE_FILE_INFO } = require('./mock-azure-file-info');
const MOCK_BANKS = require('./mock-banks');

const MOCK_UTILISATION_REPORT = {
  _id: '65646e1d1621576fd7a6bc9a',
  bank: {
    id: MOCK_BANKS.HSBC.id,
    name: MOCK_BANKS.HSBC.name,
  },
  reportPeriod: {
    start: {
      month: 11,
      year: 2023,
    },
    end: {
      month: 11,
      year: 2023,
    },
  },
  dateUploaded: '2023-11-15T15:11:14Z',
  azureFileInfo: MOCK_AZURE_FILE_INFO,
  uploadedBy: {
    id: '5099803df3f4948bd2f98391',
    firstname: 'test',
    surname: 'user',
  },
};

module.exports = MOCK_UTILISATION_REPORT;
