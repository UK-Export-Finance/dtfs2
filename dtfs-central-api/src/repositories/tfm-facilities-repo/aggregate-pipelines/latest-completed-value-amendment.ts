import { ObjectId, Document } from 'mongodb';
import { TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';

export const latestCompletedValueAmendment = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  {
    $match: {
      'amendments.status': { $in: [TFM_AMENDMENT_STATUS.COMPLETED, PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED] },
      'amendments.changeFacilityValue': { $eq: true },
    },
  },
  { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
  { $limit: 1 },
];
