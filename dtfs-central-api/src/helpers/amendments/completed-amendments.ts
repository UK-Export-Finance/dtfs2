import { AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';

/**
 * Filters amendments to only those which are completed
 * @param tfmFacilityAmendments - amendments to filter
 * @returns completed amendments
 */
export const getCompletedAmendments = (tfmFacilityAmendments: TfmFacilityAmendment[]): TfmFacilityAmendment[] =>
  tfmFacilityAmendments.filter(({ status }) => status === AMENDMENT_STATUS.COMPLETED);
