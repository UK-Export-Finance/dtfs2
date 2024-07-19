import { ObjectId, Document } from 'mongodb';
import { AMENDMENT } from '../../../constants';

export const amendmentsByDealId = (dealId: string | ObjectId): Document[] => [
  { $match: { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } } },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  { $project: { _id: false, amendments: true } },
  { $unwind: '$amendments' },
  { $sort: { 'amendments.submittedAt': -1 } },
  {
    $match: {
      'amendments.status': { $ne: AMENDMENT.AMENDMENT_STATUS.NOT_STARTED },
      'amendments.submittedByPim': { $eq: true },
    },
  },
  { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
  { $project: { _id: false, amendments: true } },
];
