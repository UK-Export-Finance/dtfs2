import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_TYPES, TfmAmendmentStatus } from '@ukef/dtfs2-common';

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
