import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_TYPES, TfmAmendmentStatus } from '@ukef/dtfs2-common';

/**
 * Generate aggregate pipeline to get tfm amendments by facility id and status
 * @param facilityId - the facility id
 * @param status - the tfm amendment status
 * @returns aggregate pipeline to get tfm amendments by facility id and status
 */
export const tfmAmendmentsByFacilityIdAndStatus = (facilityId: string | ObjectId, status: TfmAmendmentStatus): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
  { $project: { _id: false, amendments: true } },
];
