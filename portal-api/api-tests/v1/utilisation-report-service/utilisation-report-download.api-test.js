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
  let barclaysBank;
  let hsbcBank;
  let aBarclaysPaymentReportOfficer;
  let aHsbcPaymentReportOfficer;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aBarclaysPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Barclays Bank').one();
    aHsbcPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('HSBC').one();
    barclaysBank = aBarclaysPaymentReportOfficer.bank;
    hsbcBank = aHsbcPaymentReportOfficer.bank;
    const getUtilisationSpy = jest.spyOn(api, 'getUtilisationReportById');
    getUtilisationSpy.mockImplementation(() => ({
      azureFileInfo: { filename: 'test-file.csv', mimetype: 'text/csv' },
      bankId: barclaysBank.id,
    }));
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  describe('GET /v1/banks/:bankId/utilisation-report-download/:id', () => {
    const getUrl = ({ bankId, reportId }) => `/v1/banks/${bankId}/utilisation-report-download/${reportId}`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(getUrl({ bankId: barclaysBank.id, reportId: '10' })),
      makeRequestWithAuthHeader: (authHeader) => get(getUrl({ bankId: barclaysBank.id, reportId: '10' }), { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [PAYMENT_REPORT_OFFICER],
      getUserWithRole: (role) => testUsers().withRole(role).withBankName(barclaysBank.name).one(),
      makeRequestAsUser: (user) => as(user).get(getUrl({ bankId: barclaysBank.id, reportId: '10' })),
      successStatusCode: 200,
    });

    it("returns 400 if the 'bankId' path param is invalid", async () => {
      // Arrange
      const url = getUrl({ bankId: 'invalid-bank-id', reportId: '10' });
      const { status } = await as(aHsbcPaymentReportOfficer).get(url);

      // Assert
      expect(status).toEqual(400);
    });

    it("returns 400 if the report ID 'id' path param is invalid", async () => {
      // Arrange
      const url = getUrl({ bankId: barclaysBank.id, reportId: 'invalid-sql-id' });
      const { status } = await as(aHsbcPaymentReportOfficer).get(url);

      // Assert
      expect(status).toEqual(400);
    });

    it('returns 401 if trying to download of file from a different user organisation', async () => {
      // Arrange
      const { status } = await as(aHsbcPaymentReportOfficer).get(getUrl({ bankId: barclaysBank.id, reportId: '10' }));

      // Assert
      expect(status).toEqual(401);
    });

    it('returns 500 if trying to download of file from a different user organisation with own bank id', async () => {
      // Arrange
      const { status } = await as(aHsbcPaymentReportOfficer).get(getUrl({ bankId: hsbcBank.id, reportId: '10' }));

      // Assert
      expect(status).toEqual(500);
    });
  });
});
