import { AMENDMENT_STATUS } from '../constants/amendments';
import { ValuesOf } from './types-helper';

export type AmendmentStatus = ValuesOf<typeof AMENDMENT_STATUS>;
