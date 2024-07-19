import { ObjectId, Document } from 'mongodb';
import { AmendmentStatus } from '../../../types/amendment-status';

export const amendmentsByFacilityIdAndStatus = (facilityId: string | ObjectId, status: AmendmentStatus): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
