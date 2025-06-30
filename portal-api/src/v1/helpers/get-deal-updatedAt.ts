import { Deal, FacilityAmendment } from '@ukef/dtfs2-common';

/**
 * Updates the `updatedAt` property of a deal to reflect the latest amendment's update time, if it is more recent.
 *
 * @param deal - The deal object to update.
 * @param amendments - An array of amendment objects with acknowledged status, each potentially containing an `updatedAt` timestamp (in seconds).
 * @returns A new deal object with the `updatedAt` property set to the latest update time (in milliseconds) between the deal and its amendments.
 */
export const getDealUpdatedAt = (deal: Deal, amendments: FacilityAmendment[]) => {
  if (amendments && amendments.length) {
    let latestAmendmentUpdatedAt: number = Number(deal.updatedAt);
    const now = new Date();
    // check and filter out amendments with effective date in the future
    const amendmentsWithEffectiveDateInThePast = amendments.filter((amendment) => amendment.effectiveDate && new Date(amendment.effectiveDate) <= now);
    const maxAmendmentUpdatedAt = Math.max(...amendmentsWithEffectiveDateInThePast.map((amendment) => amendment.updatedAt || 0));
    // convert the max updatedAt on amendment to milliseconds to compare with the updatedAt on deal
    const amendmentUpdatedAtMilliseconds = maxAmendmentUpdatedAt * 1000;
    if (amendmentUpdatedAtMilliseconds > latestAmendmentUpdatedAt) {
      latestAmendmentUpdatedAt = amendmentUpdatedAtMilliseconds;
    }
    return {
      ...deal,
      updatedAt: latestAmendmentUpdatedAt,
    };
  }
  return deal;
};
