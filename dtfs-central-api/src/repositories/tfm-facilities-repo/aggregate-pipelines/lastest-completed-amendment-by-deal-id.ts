import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_STATUS } from '@ukef/dtfs2-common';

export const latestCompletedAmendmentByDealId = (dealId: string | ObjectId): Document[] => [
  { $match: { 'facilitySnapshot.dealId': { $eq: new ObjectId(dealId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': AMENDMENT_STATUS.COMPLETED } },
  { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
  { $limit: 1 },
];
