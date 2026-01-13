import { SummaryListRow, DATE_FORMATS, FacilityAllTypeAmendmentWithUkefId, AMENDMENT_TYPES } from '@ukef/dtfs2-common';
import { format, fromUnixTime } from 'date-fns';
import { getAmendmentCreatedByRow } from '../helpers/get-amendment-created-by-row';

type MappedFacilityAmendmentWithUkefId = {
  referenceNumber: string;
  amendmentRows: SummaryListRow[];
  isTypePortal?: boolean;
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
  /**
   * Sorted view of the provided amendments array, ordered by their
   * `referenceNumber` in descending lexicographical order.
   *
   * Sorting behavior:
   * - Amendments with a defined `referenceNumber` are ordered before those
   *   without one.
   * - When both amendments have a `referenceNumber`, they are compared using
   *   `localeCompare`, placing higher / later reference numbers first.
   * - When neither amendment has a `referenceNumber`, their relative order is
   *   left unchanged.
   *
   * @remarks
   * This operation sorts the original `amendments` array in place; the
   * `sortedAmendments` reference points to the same array instance after the
   * sort has been applied.
   */
  const sortedAmendments = amendments.sort((a, b) => {
    if (a.referenceNumber && b.referenceNumber) {
      return b.referenceNumber.localeCompare(a.referenceNumber);
    }
    if (a.referenceNumber && !b.referenceNumber) {
      return -1;
    }
    if (!a.referenceNumber && b.referenceNumber) {
      return 1;
    }
    return 0;
  });

  return sortedAmendments.map((amendment) => {
    const today = new Date();
    const referenceNumber = amendment.referenceNumber ?? '';
    const amendmentRows = getAmendmentCreatedByRow(amendment);
    const effectiveDate = amendment.effectiveDate ? format(fromUnixTime(amendment.effectiveDate), DATE_FORMATS.D_MMMM_YYYY) : '';
    const hasFutureEffectiveDate = new Date(fromUnixTime(amendment.effectiveDate ?? 0)) > today;
    const isTypePortal = amendment.type === AMENDMENT_TYPES.PORTAL;

    return {
      referenceNumber,
      amendmentRows,
      isTypePortal,
      facilityId: amendment.facilityId.toString(),
      amendmentId: amendment.amendmentId.toString(),
      effectiveDate,
      hasFutureEffectiveDate,
    };
  });
};
