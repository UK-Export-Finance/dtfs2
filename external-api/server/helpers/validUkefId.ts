import { REGEX } from '@ukef/dtfs2-common';

/**
 * Ascertain if UKEF ID is valid or not
 * @param ukefId String UKEF ID
 * @returns Boolean|String False if invalid, UKEF ID otherwise
 */
export const validUkefId = (ukefId: string) => {
  const id = parseInt(ukefId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  if (!REGEX.UKEF_ID_REGEX.test(ukefId)) {
    return false;
  }

  return ukefId;
};
