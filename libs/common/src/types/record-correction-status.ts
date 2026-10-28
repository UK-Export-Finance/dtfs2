import { RECORD_CORRECTION_DISPLAY_STATUS, RECORD_CORRECTION_STATUS } from '@ukef/constants';
import { ValuesOf } from './types-helper';

export type RecordCorrectionStatus = ValuesOf<typeof RECORD_CORRECTION_STATUS>;

export type RecordCorrectionDisplayStatus = ValuesOf<typeof RECORD_CORRECTION_DISPLAY_STATUS>;
