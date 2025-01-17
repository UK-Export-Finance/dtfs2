jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { ROLES } = require('@ukef/dtfs2-common');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);

const allRoles = Object.values(ROLES);

describe('/.well-known/security.txt', () => {
  describe('GET', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/.well-known/security.txt', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });

    it('should have all the file properties', async () => {
      // Act
      const response = await get('/.well-known/security.txt');

      // Assert
      expect(response.text).toContain('Contact: https://hackerone.com/7af14fd9-fe4e-4f39-bea1-8f8a364061b8/embedded_submissions/new');
      expect(response.text).toContain('Contact: https://www.gov.uk/contact/govuk');
      expect(response.text).toContain('Contact: https://get-a-guarantee-for-export-finance.service.gov.uk/feedback');
      expect(response.text).toContain('Expires: 2026-01-17T00:00:00.000Z');
      expect(response.text).toContain('Acknowledgments: https://get-a-guarantee-for-export-finance.service.gov.uk/thanks.txt');
      expect(response.text).toContain('Preferred-Languages: en');
      expect(response.text).toContain('Canonical: https://get-a-guarantee-for-export-finance.service.gov.uk/.well-known/security.txt');
      expect(response.text).toContain('Policy: https://www.gov.uk/guidance/report-a-vulnerability-on-a-ukef-system');
      expect(response.text).toContain('Hiring: https://www.civilservicejobs.service.gov.uk/');
    });

    it('should ensure file is not expired', async () => {
      // Act
      const response = await get('/.well-known/security.txt');
      // Below should extract expiry date in YYYY-MM-DD format
      const expires = response.text.split('Expires: ')[1].split('T00:00:00.000Z')[0];
      // Convert to EPOCH
      const today = new Date().valueOf();
      const expiry = new Date(expires).valueOf();

      // Assert
      expect(today).toBeLessThan(expiry);
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
