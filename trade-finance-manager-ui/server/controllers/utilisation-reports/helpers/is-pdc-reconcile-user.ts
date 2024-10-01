import { TEAM_IDS } from '@ukef/dtfs2-common';
import { TfmSessionUser } from '../../../types/tfm-session-user';

/**
 * isPDCReconcileUser
 * returns true if user is in PDC_RECONCILE team
 * @param {TfmSessionUser} user
 * @returns {Boolean}
 */
export const isPDCReconcileUser = (user: TfmSessionUser) => user.teams.includes(TEAM_IDS.PDC_RECONCILE);
