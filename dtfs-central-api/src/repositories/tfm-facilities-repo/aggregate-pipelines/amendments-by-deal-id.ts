import { ObjectId, Document } from 'mongodb';

export const amendmentsByDealId = (dealId: string | ObjectId): Document[] => [
  { $match: { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } } },
  { $unwind: '$amendments' },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  { $project: { _id: false, amendments: true } },
];
