import { Document } from 'mongodb';

export const amendmentsByStatus = (status: string): Document[] => [
  { $project: { _id: false, amendments: '$amendments' } },
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
];
