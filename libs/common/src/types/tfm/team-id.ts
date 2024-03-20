import { ValuesOf } from '..';
import { TEAM_IDS } from '../../constants/tfm/team-ids';

export type TeamId = ValuesOf<typeof TEAM_IDS>;
