import { PORTAL_AMENDMENT_STATUS } from '../constants';
import { PortalAmendmentStatus } from '../types';

/**
 * returns the colour of the amendment status tag based on amendment status
 * @param status amendment status
 * @returns string representing the colour of the tag
 */
export const amendmentStatusTagColour = (status: PortalAmendmentStatus) => {
  switch (status) {
    case PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL:
      return 'blue';
    case PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED:
      return 'blue';
    case PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED:
      return 'green';
    default:
      return 'grey';
  }
};
