import { ValuesOf } from './types-helper';
import { RECORD_CORRECTION_DISPLAY_STATUS, RECORD_CORRECTION_STATUS } from '../constants';

export type RecordCorrectionStatus = ValuesOf<typeof RECORD_CORRECTION_STATUS>;

export type RecordCorrectionDisplayStatus = ValuesOf<typeof RECORD_CORRECTION_DISPLAY_STATUS>;
