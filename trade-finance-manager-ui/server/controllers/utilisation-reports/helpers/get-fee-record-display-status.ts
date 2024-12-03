import { FeeRecordStatus } from '@ukef/dtfs2-common';
import { FeeRecordDisplayStatus } from '../../../types/view-models';

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, FeeRecordDisplayStatus> = {
  TO_DO: 'To do',
  MATCH: 'Match',
  DOES_NOT_MATCH: 'Does not match',
  READY_TO_KEY: 'Ready to key',
  RECONCILED: 'Reconciled',
  PENDING_CORRECTION: 'Record correction requested',
};

export const getFeeRecordDisplayStatus = (status: FeeRecordStatus): FeeRecordDisplayStatus => feeRecordStatusToDisplayStatus[status];
