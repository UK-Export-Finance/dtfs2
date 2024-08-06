import { FACILITY_TYPE } from '../constants';
import { ValuesOf } from './types-helper';

export type FacilityType = ValuesOf<typeof FACILITY_TYPE>;
