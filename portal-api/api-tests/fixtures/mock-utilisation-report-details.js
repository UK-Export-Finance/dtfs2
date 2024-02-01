const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../src/constants');

const mockNotReceivedUtilisationReportDetails = {
  bank: {
    id: '123',
    name: 'Test bank',
  },
  reportPeriod: {
    start: {
      month: 1,
      year: 2024,
    },
    end: {
      month: 1,
      year: 2024,
    },
  },
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  azureFileInfo: null,
};

const mockReceivedUtilisationReportDetailsWithoutId = {
  bank: {
    id: '123',
    name: 'Test bank',
  },
  reportPeriod: {
    start: {
      month: 1,
      year: 2024,
    },
    end: {
      month: 1,
      year: 2024,
    },
  },
  dateUploaded: new Date('2024-01-01'),
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
  azureFileInfo: {
    fullPath: 'www.abc.com',
  },
  uploadedBy: {
    id: '5099803df3f4948bd2f98391',
    firstname: 'Test',
    surname: 'User',
  },
};

module.exports = {
  MOCK_NOT_RECEIVED_REPORT_DETAILS: mockNotReceivedUtilisationReportDetails,
  MOCK_RECEIVED_REPORT_DETAILS_WITHOUT_ID: mockReceivedUtilisationReportDetailsWithoutId,
};
