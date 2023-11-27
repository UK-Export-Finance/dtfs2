const { ObjectId } = require('mongodb');
const { produce } = require('immer');
const testUserCache = require('../../api-test-users');
const app = require('../../../src/createApp');
const { as, get } = require('../../api')(app);
const wipeDB = require('../../wipeDB');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { insertOneUtilisationReportDetails } = require('../../insertUtilisationReportDetails');
const MOCK_UTILISATION_REPORT = require('../../../test-helpers/mock-utilisation-reports');

describe('/v1/banks/:bankId/utilisation-report-download/:_id', () => {
  let noRoles;
  let testUsers;
  let barclaysBank;
  let aBarclaysPaymentReportOfficer;
  let aHsbcPaymentReportOfficer;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('Barclays Bank').one();
    aHsbcPaymentReportOfficer = testUsers().withRole(PAYMENT_REPORT_OFFICER).withBankName('HSBC').one();
    barclaysBank = aBarclaysPaymentReportOfficer.bank;
  });

  beforeEach(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  describe('GET /v1/banks/:bankId/utilisation-report-download/:id', () => {
    const filename = 'test-file.csv';
    let aBarclaysUtilisationReportDownloadUrl;

    const getUrl = ({ bankId, reportId }) => `/v1/banks/${bankId}/utilisation-report-download/${reportId}`;

    beforeEach(async () => {
      const newReport = produce(MOCK_UTILISATION_REPORT, (draftReport) => {
        draftReport.bank.id = barclaysBank.id;
        draftReport.bank.name = barclaysBank.name;
        draftReport.azureFileInfo.filename = filename;
      });

      const {
        body: { _id: createdReportId },
      } = await as(aBarclaysPaymentReportOfficer).post(newReport).to('/utilisation-reports');

      aBarclaysUtilisationReportDownloadUrl = getUrl({ bankId: barclaysBank.id, reportId: createdReportId });
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(aBarclaysUtilisationReportDownloadUrl),
      makeRequestWithAuthHeader: (authHeader) => get(aBarclaysUtilisationReportDownloadUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [PAYMENT_REPORT_OFFICER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).get(aBarclaysUtilisationReportDownloadUrl),
      successStatusCode: 200,
    });

    it('downloads an uploaded file', async () => {
      // Act
      const { status, text, header } = await as(aBarclaysPaymentReportOfficer).get(aBarclaysUtilisationReportDownloadUrl);

      // Assert
      expect(status).toEqual(200);
      expect(header['content-disposition']).toEqual(`attachment; filename=${filename}`);
      // See '__mocks__/@azure/storage-file-share.js'
      expect(text).toEqual('mockFile');
    });

    it("returns 400 if the 'bankId' path param is invalid", async () => {
      // Arrange
      const url = getUrl({ bankId: 'invalid-bank-id', reportId: '5099803df3f4948bd2f98391' });
      const { status } = await as(aHsbcPaymentReportOfficer).get(url);

      // Assert
      expect(status).toEqual(400);
    });

    it("returns 400 if the report MongoDB ID '_id' path param is invalid", async () => {
      // Arrange
      const url = getUrl({ bankId: barclaysBank.id, reportId: 'invalid-mongo-id' });
      const { status } = await as(aHsbcPaymentReportOfficer).get(url);

      // Assert
      expect(status).toEqual(400);
    });

    it('returns 401 if trying to download of file from a different user organisation', async () => {
      // Arrange
      const { status } = await as(aHsbcPaymentReportOfficer).get(aBarclaysUtilisationReportDownloadUrl);

      // Assert
      expect(status).toEqual(401);
    });
  });
});
