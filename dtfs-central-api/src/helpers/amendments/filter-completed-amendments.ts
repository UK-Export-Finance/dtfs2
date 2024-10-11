import { AMENDMENT_STATUS, TfmFacilityAmendment } from '@ukef/dtfs2-common';

/**
 * Filters amendments to only those which are completed
 * @param tfmFacilityAmendments - amendments to filter
 * @returns completed amendments
 */
export const filterCompletedAmendments = (tfmFacilityAmendments: TfmFacilityAmendment[]): TfmFacilityAmendment[] =>
  tfmFacilityAmendments.filter(({ status }) => status === AMENDMENT_STATUS.COMPLETED);
