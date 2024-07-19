import { Document } from 'mongodb';
import { AmendmentStatus } from '../../../types/amendment-status';

export const amendmentsByStatus = (status: AmendmentStatus): Document[] => [
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
