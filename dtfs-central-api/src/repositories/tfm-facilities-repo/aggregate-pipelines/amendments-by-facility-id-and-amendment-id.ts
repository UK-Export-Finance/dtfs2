import { ObjectId, Document } from 'mongodb';

export const amendmentsByFacilityIdAndAmendmentId = (facilityId: string | ObjectId, amendmentId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  { $unwind: '$amendments' },
  { $match: { 'amendments.amendmentId': { $eq: new ObjectId(amendmentId) } } },
  { $project: { _id: false, amendments: true } },
];
