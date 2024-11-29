import { FeeRecordStatus } from '@ukef/dtfs2-common';
import { FeeRecordDisplayStatus } from '../../../types/view-models';

const feeRecordStatusToDisplayStatus: Record<FeeRecordStatus, FeeRecordDisplayStatus> = {
  TO_DO: 'TO DO',
  MATCH: 'MATCH',
  DOES_NOT_MATCH: 'DOES NOT MATCH',
  READY_TO_KEY: 'READY TO KEY',
  RECONCILED: 'RECONCILED',
  PENDING_CORRECTION: 'RECORD CORRECTION REQUESTED',
};

export const getFeeRecordDisplayStatus = (status: FeeRecordStatus): FeeRecordDisplayStatus => feeRecordStatusToDisplayStatus[status];
