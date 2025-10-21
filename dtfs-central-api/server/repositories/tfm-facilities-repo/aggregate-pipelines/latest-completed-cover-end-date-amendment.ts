import { ObjectId, Document } from 'mongodb';
import { TFM_AMENDMENT_STATUS, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';

/**
 * Generates the query to get the latest completed cover end date amendment for a facility
 * @param facilityId The ID of the facility
 * @returns Query to get an array of documents representing the latest completed cover end date amendment
 */
export const latestCompletedCoverEndDateAmendment = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  {
    $match: {
      'amendments.status': { $in: [TFM_AMENDMENT_STATUS.COMPLETED, PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED] },
      'amendments.changeCoverEndDate': { $eq: true },
    },
  },
  { $sort: { 'amendments.referenceNumber': -1, 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
  { $limit: 1 },
];
