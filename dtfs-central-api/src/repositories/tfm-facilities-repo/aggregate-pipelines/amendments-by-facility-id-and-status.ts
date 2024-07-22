import { ObjectId, Document } from 'mongodb';

export const amendmentsByFacilityIdAndStatus = (facilityId: string | ObjectId, status: string): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $group: { _id: false, amendments: { $push: '$amendments' } } },
];
