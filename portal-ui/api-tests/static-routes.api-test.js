jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { createApi } = require('@ukef/dtfs2-common/test-helpers');
const { ROLES, getISO8601, addYear } = require('@ukef/dtfs2-common');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');

const { get } = createApi(app);

const allRoles = Object.values(ROLES);

describe('/.well-known/security.txt', () => {
  describe('GET', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/.well-known/security.txt', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });

    it('should contain contact information', async () => {
      // Act
      const response = await get('/.well-known/security.txt');

      // Assert
      expect(response.text).toContain('Contact: https://hackerone.com/7af14fd9-fe4e-4f39-bea1-8f8a364061b8/embedded_submissions/new');
      expect(response.text).toContain('Contact: https://www.gov.uk/contact/govuk');
      expect(response.text).toContain('Contact: https://get-a-guarantee-for-export-finance.service.gov.uk/feedback');
    });

    it('should contain expires information', async () => {
      // Act
      const response = await get('/.well-known/security.txt');
      // Only get the YYYY-MM-DD
      const addOneYear = addYear(1);
      const oneYearFromToday = getISO8601(addOneYear);
      const OneYearFromTodayDate = oneYearFromToday.split('T')[0];

      // Assert
      expect(response.text).toContain(`Expires: ${OneYearFromTodayDate}`);
    });

    it('should contain acknowledgments information', async () => {
      // Act
      const response = await get('/.well-known/security.txt');

      // Assert
      expect(response.text).toContain('Acknowledgments: https://get-a-guarantee-for-export-finance.service.gov.uk/thanks.txt');
    });

    it('should contain prederred language information', async () => {
      // Act
      const response = await get('/.well-known/security.txt');

      // Assert
      expect(response.text).toContain('Preferred-Languages: en');
    });

    it('should contain canonical information', async () => {
      // Act
      const response = await get('/.well-known/security.txt');

      // Assert
      expect(response.text).toContain('Canonical: https://get-a-guarantee-for-export-finance.service.gov.uk/.well-known/security.txt');
    });

    it('should contain policy information', async () => {
      // Act
      const response = await get('/.well-known/security.txt');

      // Assert
      expect(response.text).toContain('Policy: https://www.gov.uk/guidance/report-a-vulnerability-on-a-ukef-system');
    });

    it('should contain hiring information', async () => {
      // Act
      const response = await get('/.well-known/security.txt');

      // Assert
      expect(response.text).toContain('Hiring: https://www.civilservicejobs.service.gov.uk/');
    });
  });
});

describe('/thanks.txt', () => {
  describe('GET', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/thanks.txt', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
