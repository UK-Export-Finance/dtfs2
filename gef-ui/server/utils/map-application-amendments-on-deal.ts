import { SummaryListRow, DATE_FORMATS, FacilityAllTypeAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { format, fromUnixTime } from 'date-fns';
import { getAmendmentCreatedByRow } from '../helpers/get-amendment-created-by-row';

type MappedFacilityAmendmentWithUkefId = {
  referenceNumber: string;
  amendmentRows: SummaryListRow[];
  type?: string;
  facilityId?: string;
  amendmentId?: string;
  effectiveDate?: string;
  hasFutureEffectiveDate?: boolean;
};

/**
 * Maps an array of `FacilityAllTypeAmendmentWithUkefId` to an array of `MappedFacilityAmendmentWithUkefId` objects.
 * This function transforms the structure of the amendments to match the required format.
 *
 * @param amendments - An array of amendments ,to be mapped. Each amendment contains details about a facility amendment.
 * @returns An array of mapped amendments
 */
export const mapApplicationAmendmentsOnDeal = (amendments: FacilityAllTypeAmendmentWithUkefId[]): MappedFacilityAmendmentWithUkefId[] => {
  return amendments.map((amendment) => {
    const today = new Date();
    const referenceNumber = amendment.referenceNumber ?? '';
    const amendmentRows = getAmendmentCreatedByRow(amendment);
    const effectiveDate = amendment.effectiveDate ? format(fromUnixTime(amendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY) : '';
    const hasFutureEffectiveDate = new Date(fromUnixTime(amendment.effectiveDate ?? 0)) > today;

    return {
      referenceNumber,
      amendmentRows,
      type: amendment.type,
      facilityId: amendment.facilityId.toString(),
      amendmentId: amendment.amendmentId.toString(),
      effectiveDate,
      hasFutureEffectiveDate,
    };
  });
};
