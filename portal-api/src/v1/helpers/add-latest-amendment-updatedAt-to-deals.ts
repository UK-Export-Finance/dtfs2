import { Deal, FacilityAmendment } from '@ukef/dtfs2-common';

/**
 * Updates the `updatedAt` property of a deal to reflect the latest amendment's update time, if it is more recent.
 *
 * @param deal - The deal object to update.
 * @param amendments - An array of amendment objects, each potentially containing an `updatedAt` timestamp (in seconds).
 * @returns A new deal object with the `updatedAt` property set to the latest update time (in milliseconds) between the deal and its amendments.
 */
export const addLatestAmendmentUpdatedAtToDeals = (deal: Deal, amendments: FacilityAmendment[]) => {
  let latestAmendmentUpdatedAt: number = Number(deal.updatedAt);
  if (amendments?.length) {
    const maxAmendmentUpdatedAt = Math.max(...amendments.map((amendment) => amendment.updatedAt || 0));
    const amendmentMsUpdatedAt = maxAmendmentUpdatedAt * 1000;
    if (amendmentMsUpdatedAt > latestAmendmentUpdatedAt) {
      latestAmendmentUpdatedAt = amendmentMsUpdatedAt;
    }
  }
  return {
    ...deal,
    updatedAt: latestAmendmentUpdatedAt,
  };
};
