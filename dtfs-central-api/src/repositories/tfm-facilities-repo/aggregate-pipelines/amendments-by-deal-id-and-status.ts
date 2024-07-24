import { ObjectId, Document } from 'mongodb';
import { AmendmentStatus } from '../../../types/amendment-status';

export const amendmentsByDealIdAndStatus = (dealId: string | ObjectId, status: AmendmentStatus): Document[] => [
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
