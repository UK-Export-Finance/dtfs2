import { ValuesOf } from './types-helper';
import { PDC_TEAM_IDS, TEAM_IDS, NON_PDC_TEAM_IDS } from '../constants';

export type PdcTeamId = ValuesOf<typeof PDC_TEAM_IDS>;

export type NonPdcTeamId = ValuesOf<typeof NON_PDC_TEAM_IDS>;

export type TeamId = ValuesOf<typeof TEAM_IDS>;

export type TeamIds = { [s: string]: string; };
