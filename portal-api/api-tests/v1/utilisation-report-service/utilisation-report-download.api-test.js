const testUserCache = require('../../api-test-users');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const databaseHelper = require('../../database-helper');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const api = require('../../../src/v1/api');

jest.mock('../../../src/drivers/fileshare', () => ({
  getConfig: jest.fn(() => ({ EXPORT_FOLDER: 'mock-folder' })),
  readFile: jest.fn().mockResolvedValue(Buffer.of(1, 2, 3)),
}));

describe('/v1/banks/:bankId/utilisation-report-download/:_id', () => {
  let testUsers;
  let Testbank1Bank;
  let Testbank2Bank;
  let aTestbank1PaymentReportOfficer;
  let aTestbank2PaymentReportOfficer;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aTestbank1PaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Bank 1').one();
    aTestbank2PaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Bank 2').one();
    Testbank1Bank = aTestbank1PaymentReportOfficer.bank;
    Testbank2Bank = aTestbank2PaymentReportOfficer.bank;
    const getUtilisationSpy = jest.spyOn(api, 'getUtilisationReportById');
    getUtilisationSpy.mockImplementation(() => ({
      azureFileInfo: { filename: 'test-file.csv', mimetype: 'text/csv' },
      bankId: Testbank1Bank.id,
    }));
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  describe('GET /v1/banks/:bankId/utilisation-report-download/:id', () => {
    const getUrl = ({ bankId, reportId }) => `/v1/banks/${bankId}/utilisation-report-download/${reportId}`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(getUrl({ bankId: Testbank1Bank.id, reportId: '10' })),
      makeRequestWithAuthHeader: (authHeader) => get(getUrl({ bankId: Testbank1Bank.id, reportId: '10' }), { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [PAYMENT_REPORT_OFFICER],
      getUserWithRole: (role) => testUsers().withRole(role).withBankName(Testbank1Bank.name).one(),
      makeRequestAsUser: (user) => as(user).get(getUrl({ bankId: Testbank1Bank.id, reportId: '10' })),
      successStatusCode: 200,
    });

    it("returns 400 if the 'bankId' path param is invalid", async () => {
      // Arrange
      const url = getUrl({ bankId: 'invalid-bank-id', reportId: '10' });
      const { status } = await as(aTestbank2PaymentReportOfficer).get(url);

      // Assert
      expect(status).toEqual(400);
    });

    it("returns 400 if the report ID 'id' path param is invalid", async () => {
      // Arrange
      const url = getUrl({ bankId: Testbank1Bank.id, reportId: 'invalid-sql-id' });
      const { status } = await as(aTestbank2PaymentReportOfficer).get(url);

      // Assert
      expect(status).toEqual(400);
    });

    it('returns 401 if trying to download of file from a different user organisation', async () => {
      // Arrange
      const { status } = await as(aTestbank2PaymentReportOfficer).get(getUrl({ bankId: Testbank1Bank.id, reportId: '10' }));

      // Assert
      expect(status).toEqual(401);
    });

    it('returns 500 if trying to download of file from a different user organisation with own bank id', async () => {
      // Arrange
      const { status } = await as(aTestbank2PaymentReportOfficer).get(getUrl({ bankId: Testbank2Bank.id, reportId: '10' }));

      // Assert
      expect(status).toEqual(500);
    });
  });
});
