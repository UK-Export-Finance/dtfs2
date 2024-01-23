import { ValuesOf } from './types-helper';
import { PDC_TEAM_IDS, TEAM_IDS } from '../constants';

export type PdcTeamId = ValuesOf<typeof PDC_TEAM_IDS>;

export type TeamId = ValuesOf<typeof TEAM_IDS>;
