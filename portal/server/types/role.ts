import { ValuesOf } from './types-helper';
import { ROLES } from '../constants';

export type Role = ValuesOf<typeof ROLES>;
