import { ObjectId, Document } from 'mongodb';

export const amendmentsByDealIdAndStatus = (dealId: string | ObjectId, status: string): Document[] => [
  { $match: { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } } },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
  { $project: { _id: false, amendments: true } },
];
