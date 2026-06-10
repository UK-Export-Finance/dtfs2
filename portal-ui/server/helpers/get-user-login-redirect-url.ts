import { PortalSessionUser } from '@ukef/dtfs2-common';
import getUserRoles from './getUserRoles';
import { LANDING_PAGES } from '../constants';

type UserRolesCheck = {
  isMaker: boolean;
  isChecker: boolean;
  isAdmin: boolean;
  isPaymentReportOfficer: boolean;
  isReadOnly: boolean;
};

/**
 * Gets the redirect url for the user after they have successfully logged in
 * @param {PortalSessionUser} user - The user object
 * @returns {string} The url to redirect the user to
 */
export const getUserRedirectUrl = (user: PortalSessionUser): string => {
  const { isMaker, isChecker, isAdmin, isPaymentReportOfficer } = getUserRoles(user.roles) as UserRolesCheck;

  if (isMaker || isChecker || isAdmin) {
    return LANDING_PAGES.DEFAULT;
  }

  if (isPaymentReportOfficer) {
    return LANDING_PAGES.UTILISATION_REPORT_UPLOAD;
  }

  return LANDING_PAGES.DEFAULT;
};
