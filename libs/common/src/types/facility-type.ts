import { FACILITY_TYPE, GEF_FACILITY_TYPE } from '../constants';
import { ValuesOf } from './types-helper';

export type GefFacilityType = ValuesOf<typeof GEF_FACILITY_TYPE>;

export type FacilityType = ValuesOf<typeof FACILITY_TYPE>;
