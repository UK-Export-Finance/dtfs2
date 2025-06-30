import { PORTAL_AMENDMENT_STATUS, STATUS_TAG_COLOURS } from '../constants';
import { PortalAmendmentStatus } from '../types';

/**
 * Returns the facility amendment status tag colour with regards to its status.
 * @param status amendment status
 * @returns string representing the colour of the tag
 */
export const getAmendmentStatusTagColour = (status: PortalAmendmentStatus) => {
  switch (status) {
    case PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL:
      return STATUS_TAG_COLOURS.BLUE;
    case PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED:
      return STATUS_TAG_COLOURS.BLUE;
    case PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED:
      return STATUS_TAG_COLOURS.GREEN;
    default:
      return STATUS_TAG_COLOURS.GREY;
  }
};
