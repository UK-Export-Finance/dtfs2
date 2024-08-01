import { ObjectId, Document } from 'mongodb';
import { AmendmentStatus } from '@ukef/dtfs2-common';

export const amendmentsByFacilityIdAndStatus = (facilityId: string | ObjectId, status: AmendmentStatus): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
