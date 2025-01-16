import { ObjectId, Document } from 'mongodb';
import { TfmAmendmentStatus } from '@ukef/dtfs2-common';

export const amendmentsByFacilityIdAndStatus = (facilityId: string | ObjectId, status: TfmAmendmentStatus): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
