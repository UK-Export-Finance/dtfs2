import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_TYPES, TfmAmendmentStatus } from '@ukef/dtfs2-common';

/**
 * Generate aggregate pipeline to get tfm amendments by deal id and status
 * @param dealId - the deal id
 * @param status - the tfm amendment status
 * @returns aggregate pipeline to get tfm amendments by deal id and status
 */
export const tfmAmendmentsByDealIdAndStatus = (dealId: string | ObjectId, status: TfmAmendmentStatus): Document[] => [
  { $match: { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } } },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
  { $project: { _id: false, amendments: true } },
];
