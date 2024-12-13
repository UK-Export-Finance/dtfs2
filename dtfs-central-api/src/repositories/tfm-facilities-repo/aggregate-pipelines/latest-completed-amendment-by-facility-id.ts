import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_STATUS, AMENDMENT_TYPES } from '@ukef/dtfs2-common';

export const latestCompletedTfmAmendmentByFacilityId = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: AMENDMENT_STATUS.COMPLETED }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
  { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
  { $limit: 1 },
];
