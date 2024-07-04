import { KeyingSheetStatus } from '@ukef/dtfs2-common';
import { KeyingSheetDisplayStatus } from '../../../types/view-models';

const keyingSheetStatusToDisplayStatus: Record<KeyingSheetStatus, KeyingSheetDisplayStatus> = {
  TO_DO: 'TO DO',
  DONE: 'DONE',
};

export const getKeyingSheetDisplayStatus = (status: KeyingSheetStatus): KeyingSheetDisplayStatus => keyingSheetStatusToDisplayStatus[status];
