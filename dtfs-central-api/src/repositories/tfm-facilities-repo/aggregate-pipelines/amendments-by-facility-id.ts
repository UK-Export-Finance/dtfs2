import { Document, ObjectId } from 'mongodb';

export const amendmentsByFacilityId = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $project: { _id: false, amendments: '$amendments' } },
  { $unwind: '$amendments' },
  { $project: { _id: false, amendments: true } },
];
