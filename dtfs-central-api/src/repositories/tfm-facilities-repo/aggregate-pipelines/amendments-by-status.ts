import { Document } from 'mongodb';

export const amendmentsByStatus = (status: string): Document[] => [
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
