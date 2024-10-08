const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');

const api = require('../../../src/v1/api');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const { as, postMultipartForm } = require('../../api')(app);
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { uploadFile } = require('../../../src/drivers/fileshare');

const { MOCK_FILE_INFO } = require('../../../test-helpers/mock-azure-file-info');

jest.mock('../../../src/drivers/fileshare', () => ({
  getConfig: jest.fn(() => ({ EXPORT_FOLDER: 'mock-folder' })),
  uploadFile: jest.fn(),
}));

uploadFile.mockImplementation(() => MOCK_FILE_INFO);

describe('/v1/utilisation-reports', () => {
  let testUsers;

  const uploadingUser = {
    username: 'payment-report-officer',
    password: 'AbC!2345',
    firstname: 'Payton',
    surname: 'Archer',
    email: 'payment-officer1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [PAYMENT_REPORT_OFFICER],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
    },
  };

  const testCsvData = {
    user: uploadingUser,
    reportPeriod: {
      start: {
        month: 1,
        year: 2020,
      },
      end: {
        month: 1,
        year: 2020,
      },
    },
    formattedReportPeriod: 'Jan 2020',
    reportData: [
      {
        'bank facility reference': 'abc',
        'ukef facility id': '20001371',
        exporter: 'test exporter',
        'base currency': 'GBP',
        'facility limit': 600000,
        'facility utilisation': 300000,
        'total fees accrued for the period': 367.23,
        'fees paid to ukef for the period': 367.23,
        'payment reference': 'test exporter / 123',
      },
    ],
  };

  const testFiles = [
    {
      fieldname: 'csvFile',
      filepath: 'api-tests/fixtures/utilisation-report.csv',
    },
  ];

  const saveUtilisationReportSpy = jest.spyOn(api, 'saveUtilisationReport');
  /**
   * @type {import('../../../src/v1/api-response-types').SaveUtilisationReportResponseBody}
   */
  const saveUtilisationReportResponseBody = { dateUploaded: new Date() };

  const getUtilisationReportsSpy = jest.spyOn(api, 'getUtilisationReports');
  /**
   * @type {import('../../../src/v1/api-response-types').UtilisationReportResponseBody[]}
   */
  const getUtilisationReportsResponseBody = [
    {
      id: 1,
      bankId: uploadingUser.bank.id,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      uploadedByUserId: undefined,
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
      azureFileInfo: null,
      dateUploaded: undefined,
    },
  ];

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    saveUtilisationReportSpy.mockResolvedValue(saveUtilisationReportResponseBody);
    getUtilisationReportsSpy.mockResolvedValue(getUtilisationReportsResponseBody);
  });

  describe('POST /v1/utilisation-reports', () => {
    const utilisationReportsUrl = '/v1/utilisation-reports';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => postMultipartForm({ url: utilisationReportsUrl, data: testCsvData, files: [] }),
      makeRequestWithAuthHeader: (authHeader) =>
        postMultipartForm({
          url: utilisationReportsUrl,
          data: testCsvData,
          files: [],
          headers: { Authorization: authHeader },
        }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [PAYMENT_REPORT_OFFICER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).postMultipartForm(testCsvData, testFiles).to(utilisationReportsUrl),
      successStatusCode: 201,
    });
  });
});
