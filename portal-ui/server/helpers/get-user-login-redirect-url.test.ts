import { ROLES } from '@ukef/dtfs2-common';
import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { getUserRedirectUrl } from './get-user-login-redirect-url';
import { LANDING_PAGES } from '../constants';

describe('getUserRedirectUrl', () => {
  describe('when the user is a maker', () => {
    it('should return the default landing page', () => {
      const user = { ...aPortalSessionUser(), roles: [ROLES.MAKER] };

      const result = getUserRedirectUrl(user);

      expect(result).toEqual(LANDING_PAGES.DEFAULT);
    });
  });

  describe('when the user is a checker', () => {
    it('should return the default landing page', () => {
      const user = { ...aPortalSessionUser(), roles: [ROLES.CHECKER] };

      const result = getUserRedirectUrl(user);

      expect(result).toEqual(LANDING_PAGES.DEFAULT);
    });
  });

  describe('when the user is an admin', () => {
    it('should return the default landing page', () => {
      const user = { ...aPortalSessionUser(), roles: [ROLES.ADMIN] };

      const result = getUserRedirectUrl(user);

      expect(result).toEqual(LANDING_PAGES.DEFAULT);
    });
  });

  describe('when the user is a payment report officer', () => {
    it('should return the utilisation report upload landing page', () => {
      const user = { ...aPortalSessionUser(), roles: [ROLES.PAYMENT_REPORT_OFFICER] };

      const result = getUserRedirectUrl(user);

      expect(result).toEqual(LANDING_PAGES.UTILISATION_REPORT_UPLOAD);
    });
  });

  describe('when the user is a maker and payment report officer', () => {
    it('should return the default landing page', () => {
      const user = { ...aPortalSessionUser(), roles: [ROLES.MAKER, ROLES.PAYMENT_REPORT_OFFICER] };

      const result = getUserRedirectUrl(user);

      expect(result).toEqual(LANDING_PAGES.DEFAULT);
    });
  });

  describe('when the user is read-only', () => {
    it('should return the default landing page', () => {
      const user = { ...aPortalSessionUser(), roles: [ROLES.READ_ONLY] };

      const result = getUserRedirectUrl(user);

      expect(result).toEqual(LANDING_PAGES.DEFAULT);
    });
  });

  describe('when the user has no roles', () => {
    it('should return the default landing page', () => {
      const user = { ...aPortalSessionUser(), roles: [] };

      const result = getUserRedirectUrl(user);

      expect(result).toEqual(LANDING_PAGES.DEFAULT);
    });
  });
});
