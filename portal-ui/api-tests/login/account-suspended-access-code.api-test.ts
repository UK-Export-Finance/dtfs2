import { HttpStatusCode } from 'axios';
import { createApi } from '@ukef/dtfs2-common/api-test';
import app from '../../server/createApp';
import { mockDtfs2CommonLoginApiModule } from './helpers/mock-portal-ui-login-api-modules.ts';

jest.mock('@ukef/dtfs2-common', () => mockDtfs2CommonLoginApiModule());

describe('GET /login/temporarily-suspended-access-code', () => {
  const { get } = createApi(app);

  const originalPortal2faEnabled = process.env.FF_PORTAL_2FA_ENABLED;

  afterAll(() => {
    if (originalPortal2faEnabled === undefined) {
      delete process.env.FF_PORTAL_2FA_ENABLED;
    } else {
      process.env.FF_PORTAL_2FA_ENABLED = originalPortal2faEnabled;
    }
  });

  describe('when FF_PORTAL_2FA_ENABLED is true', () => {
    beforeEach(() => {
      process.env.FF_PORTAL_2FA_ENABLED = 'true';
    });

    it(`should render the suspended access code page with HTTP status ${HttpStatusCode.Ok}`, async () => {
      const response = await get('/login/temporarily-suspended-access-code');

      expect(response.status).toEqual(HttpStatusCode.Ok);
      expect(response.text).toContain('This account has been temporarily suspended');
    });
  });

  describe('when FF_PORTAL_2FA_ENABLED is not enabled', () => {
    beforeEach(() => {
      process.env.FF_PORTAL_2FA_ENABLED = 'false';
    });

    it(`should redirect to /not-found with HTTP status ${HttpStatusCode.Found}`, async () => {
      const response = await get('/login/temporarily-suspended-access-code');

      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/not-found');
    });
  });
});
