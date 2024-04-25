import { ValuesOf } from '..';
import { PDC_TEAM_IDS, TEAM_IDS } from '../../constants/tfm/team-ids';

export type TeamId = ValuesOf<typeof TEAM_IDS>;

export type PdcTeamId = ValuesOf<typeof PDC_TEAM_IDS>;
