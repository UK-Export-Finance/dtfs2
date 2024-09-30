import { TEAM_IDS } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../types/tfm-session-user';

export const isPDCReadUser = (user: TfmSessionUser) => user.teams.includes(TEAM_IDS.PDC_READ);
