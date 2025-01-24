import { Document } from 'mongodb';
import { AMENDMENT_TYPES, TfmAmendmentStatus } from '@ukef/dtfs2-common';

/**
 * Generate aggregate pipeline to get tfm amendments by status
 * @param status - the tfm amendment status
 * @returns aggregate pipeline to get tfm amendments by status
 */
export const tfmAmendmentsByStatus = (status: TfmAmendmentStatus): Document[] => [
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
  { $project: { _id: false, amendments: true } },
];
