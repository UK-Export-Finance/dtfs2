import { Document } from 'mongodb';
import { TfmAmendmentStatus } from '@ukef/dtfs2-common';

export const amendmentsByStatus = (status: TfmAmendmentStatus): Document[] => [
  { $unwind: '$amendments' },
  { $match: { 'amendments.status': { $eq: status } } },
  { $project: { _id: false, amendments: true } },
];
