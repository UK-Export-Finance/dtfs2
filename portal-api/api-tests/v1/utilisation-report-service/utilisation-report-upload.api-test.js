const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { DB_COLLECTIONS } = require('../../../src/constants/db-collections');

const { as, post } = require('../../api')(app);
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');

describe('/v1/utilisation-report-upload', () => {
  let noRoles;
  let testUsers;

  const newReportUpload = {
    fileBuffer: '',
    fileName: 'Barclays_June_2023.xlsx',
    month: 'June',
    year: '2023',
    bankName: 'Barclays',
  };

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);
  });

  describe('POST /v1/utilisation-report-upload', () => {
    const utilisationReportUploadUrl = '/v1/utilisation-report-upload';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => post(utilisationReportUploadUrl, newReportUpload),
      makeRequestWithAuthHeader: (authHeader) => post(utilisationReportUploadUrl, newReportUpload, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [PAYMENT_REPORT_OFFICER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).post(newReportUpload).to(utilisationReportUploadUrl),
      successStatusCode: 200,
    });
  });
});
