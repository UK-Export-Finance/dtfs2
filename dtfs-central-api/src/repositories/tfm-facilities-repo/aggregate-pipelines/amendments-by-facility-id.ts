import { Document, ObjectId } from 'mongodb';
import { AMENDMENT } from '../../../constants';

export const amendmentsByFacilityId = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $project: { _id: false, amendments: '$amendments' } },
  { $unwind: '$amendments' },
  { $sort: { 'amendments.version': -1 } },
  { $match: { 'amendments.status': { $ne: AMENDMENT.AMENDMENT_STATUS.NOT_STARTED } } },
  { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
  { $project: { _id: false, amendments: true } },
];
