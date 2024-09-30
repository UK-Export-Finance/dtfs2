import { TEAM_IDS } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../types/tfm-session-user';

/**
 * isPDCReadUser
 * returns true if user is in PDC_READ team
 * @param {TfmSessionUser} user
 * @returns {Boolean}
 */
export const isPDCReadUser = (user: TfmSessionUser) => user.teams.includes(TEAM_IDS.PDC_READ);
