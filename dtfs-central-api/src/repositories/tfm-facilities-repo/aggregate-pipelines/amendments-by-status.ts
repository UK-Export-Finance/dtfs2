import { Document } from 'mongodb';
import { AmendmentStatus } from '@ukef/dtfs2-common';

export const amendmentsByStatus = (status: AmendmentStatus): Document[] => [
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
