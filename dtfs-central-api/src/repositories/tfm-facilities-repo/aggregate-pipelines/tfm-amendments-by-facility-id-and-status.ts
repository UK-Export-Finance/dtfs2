import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_TYPES, TfmAmendmentStatus } from '@ukef/dtfs2-common';

export const tfmAmendmentsByFacilityIdAndStatus = (facilityId: string | ObjectId, status: TfmAmendmentStatus): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status }, 'amendments.type': { $ne: AMENDMENT_TYPES.PORTAL } } },
  { $project: { _id: false, amendments: true } },
];
