import { PortalUser, USER_STATUS } from '@ukef/dtfs2-common';

/**
 * checks if user is blocked or disabled
 * @param user - the portal user object
 * @returns boolean indicating if user is blocked or disabled
 */
export const isUserBlockedOrDisabled = (user: PortalUser) => user['user-status'] === USER_STATUS.BLOCKED || user.disabled === true;
