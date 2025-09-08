import { ObjectId, Document } from 'mongodb';
import { PORTAL_AMENDMENT_STATUS, AMENDMENT_TYPES } from '@ukef/dtfs2-common';

/**
 * Generate aggregate pipeline to get acknowledged portal amendments by facility id
 * @param facilityId - Mongo Facility ID
 * @returns aggregate pipeline to get acknowledged portal amendments by facility id
 */
export const acknowledgedPortalAmendmentsByFacilityId = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED }, 'amendments.type': { $eq: AMENDMENT_TYPES.PORTAL } } },
  { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
];
