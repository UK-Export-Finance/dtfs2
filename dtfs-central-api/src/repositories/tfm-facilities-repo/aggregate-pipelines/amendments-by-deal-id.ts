import { ObjectId, Document } from 'mongodb';

export const amendmentsByDealId = (dealId: string | ObjectId): Document[] => [
  { $match: { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } } },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  { $unwind: '$amendments' },
  { $project: { _id: false, amendments: true } },
];
