import { ObjectId, Document } from 'mongodb';

export const amendmentsByFacilityIdAndAmendmentId = (facilityId: string | ObjectId, amendmentId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) }, 'amendments.amendmentId': { $eq: new ObjectId(amendmentId) } } },
  {
    $addFields: {
      'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
    },
  },
  {
    $project: {
      _id: false,
      amendments: {
        $filter: {
          input: '$amendments',
          as: 'amendment',
          cond: { $eq: ['$$amendment.amendmentId', new ObjectId(amendmentId)] },
        },
      },
    },
  },
  { $unwind: '$amendments' },
];
