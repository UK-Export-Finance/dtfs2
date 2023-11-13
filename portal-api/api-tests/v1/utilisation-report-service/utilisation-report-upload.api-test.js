const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, post } = require('../../api')(app);
const { PAYMENT_REPORT_OFFICER } = require('../../../src/v1/roles/roles');
const { removeAllUtilisationReportDetails } = require('../../removeUtilisationReportDetails');

describe('/v1/utilisation-reports', () => {
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
    await removeAllUtilisationReportDetails();
  });

  describe('POST /v1/utilisation-reports', () => {
    const utilisationReportsUrl = '/v1/utilisation-reports';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => post(utilisationReportsUrl, newReportUpload),
      makeRequestWithAuthHeader: (authHeader) => post(utilisationReportsUrl, newReportUpload, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [PAYMENT_REPORT_OFFICER],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => noRoles,
      makeRequestAsUser: (user) => as(user).post(newReportUpload).to(utilisationReportsUrl),
      successStatusCode: 201,
    });
  });
});
