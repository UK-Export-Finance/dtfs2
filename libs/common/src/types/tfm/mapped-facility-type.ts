import { MAPPED_FACILITY_TYPE, MAPPED_GEF_FACILITY_TYPE } from '../../constants';
import { ValuesOf } from '../types-helper';

export type MappedGefFacilityType = ValuesOf<typeof MAPPED_GEF_FACILITY_TYPE>;

export type MappedFacilityType = ValuesOf<typeof MAPPED_FACILITY_TYPE>;
