import { ObjectId, Document } from 'mongodb';
import { AMENDMENT_STATUS, AMENDMENT_BANK_DECISION, AMENDMENT_MANAGER_DECISIONS } from '../../../constants/amendments';

export const latestCompletedAmendmentByFacilityId = (facilityId: string | ObjectId): Document[] => [
  { $match: { _id: { $eq: new ObjectId(facilityId) } } },
  { $unwind: '$amendments' },
  {
    $match: {
      $or: [
        {
          'amendments.status': { $eq: AMENDMENT_STATUS.COMPLETED },
          'amendments.submittedByPim': { $eq: true },
          'amendments.requireUkefApproval': { $eq: false },
          'amendments.changeFacilityValue': { $eq: true },
        },
        {
          'amendments.status': { $eq: AMENDMENT_STATUS.COMPLETED },
          'amendments.bankDecision.decision': { $eq: AMENDMENT_BANK_DECISION.PROCEED },
          'amendments.bankDecision.submitted': { $eq: true },
          'amendments.ukefDecision.value': { $eq: AMENDMENT_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS },
          'amendments.changeFacilityValue': { $eq: true },
        },
        {
          'amendments.status': { $eq: AMENDMENT_STATUS.COMPLETED },
          'amendments.bankDecision.decision': { $eq: AMENDMENT_BANK_DECISION.PROCEED },
          'amendments.bankDecision.submitted': { $eq: true },
          'amendments.ukefDecision.value': { $eq: AMENDMENT_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS },
          'amendments.changeFacilityValue': { $eq: true },
        },
      ],
    },
  },
  { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
  { $project: { _id: false, amendments: true } },
  { $limit: 1 },
];
