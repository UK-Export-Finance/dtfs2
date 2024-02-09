import { ValuesOf } from '..';
import { TEAMS } from '../../constants/tfm/teams';

export type Team = ValuesOf<typeof TEAMS>;
