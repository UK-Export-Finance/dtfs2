import { KeyingSheetRowStatus } from '@ukef/dtfs2-common';
import { KeyingSheetDisplayStatus } from '../../../types/view-models';

const KeyingSheetRowStatusToDisplayStatus: Record<KeyingSheetRowStatus, KeyingSheetDisplayStatus> = {
  TO_DO: 'TO DO',
  DONE: 'DONE',
};

export const getKeyingSheetDisplayStatus = (status: KeyingSheetRowStatus): KeyingSheetDisplayStatus => KeyingSheetRowStatusToDisplayStatus[status];
