const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../src/constants');
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
  dateUploaded: new Date('2023-11-15'),
  azureFileInfo: MOCK_AZURE_FILE_INFO,
  uploadedBy: {
    id: '5099803df3f4948bd2f98391',
    firstname: 'test',
    surname: 'user',
  },
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
};

const MOCK_NOT_RECEIVED_REPORT_WITHOUT_ID = {
  ...MOCK_UTILISATION_REPORT,
  _id: undefined,
  azureFileInfo: null,
  dateUploaded: null,
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
};

const MOCK_PENDING_RECONCILIATION_REPORT_DETAILS_WITHOUT_ID = {
  ...MOCK_UTILISATION_REPORT,
  _id: undefined,
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
}

module.exports = {
  MOCK_UTILISATION_REPORT,
  MOCK_NOT_RECEIVED_REPORT_WITHOUT_ID,
  MOCK_PENDING_RECONCILIATION_REPORT_DETAILS_WITHOUT_ID,
};
