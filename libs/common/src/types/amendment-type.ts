import { AMENDMENT_TYPES } from '../constants/amendments';
import { ValuesOf } from './types-helper';

export type AmendmentType = ValuesOf<typeof AMENDMENT_TYPES>;
