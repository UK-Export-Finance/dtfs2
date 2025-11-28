import { PortalUser, USER_STATUS } from '@ukef/dtfs2-common';

export const isUserBlockedOrDisabled = (user: PortalUser) => user['user-status'] === USER_STATUS.BLOCKED || user.disabled === true;
