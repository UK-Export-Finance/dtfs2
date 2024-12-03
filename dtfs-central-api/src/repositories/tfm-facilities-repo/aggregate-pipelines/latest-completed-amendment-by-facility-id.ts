import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_STATUS } from '@ukef/dtfs2-common';

export const latestCompletedAmendmentByFacilityId = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: AMENDMENT_STATUS.COMPLETED } } },
  { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
  { $limit: 1 },
];
