import { ValuesOf } from '..';
import { ROLES } from '../../constants/portal/roles';

export type Role = ValuesOf<typeof ROLES>;
