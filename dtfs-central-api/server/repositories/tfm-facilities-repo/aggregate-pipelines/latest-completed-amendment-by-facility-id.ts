import { ObjectId, Document } from 'mongodb';
import { TFM_AMENDMENT_STATUS, AMENDMENT_TYPES } from '@ukef/dtfs2-common';

// TODO: DTFS2-8159 - add sort by referenceNumber to this function
export const latestCompletedTfmAmendmentByFacilityId = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: TFM_AMENDMENT_STATUS.COMPLETED }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
  { $sort: { 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
  { $limit: 1 },
];
