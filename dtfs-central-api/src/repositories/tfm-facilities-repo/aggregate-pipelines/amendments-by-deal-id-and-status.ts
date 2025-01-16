import { ObjectId, Document } from 'mongodb';
import { TfmAmendmentStatus } from '@ukef/dtfs2-common';

export const amendmentsByDealIdAndStatus = (dealId: string | ObjectId, status: TfmAmendmentStatus): Document[] => [
  { $match: { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } } },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
