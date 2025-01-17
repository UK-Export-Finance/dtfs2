import { Document } from 'mongodb';
import { AMENDMENT_TYPES, TfmAmendmentStatus } from '@ukef/dtfs2-common';

export const tfmAmendmentsByStatus = (status: TfmAmendmentStatus): Document[] => [
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
  { $project: { _id: false, amendments: true } },
];
