import { AMENDMENT_STATUS } from '../constants/amendment-status';
import { ValuesOf } from './types-helper';

export type AmendmentStatus = ValuesOf<typeof AMENDMENT_STATUS>;
