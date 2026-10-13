import { Team, TEAM_IDS } from '@ukef/dtfs2-common';
import { MOCK_EMAIL } from '@ukef/dtfs2-common/test-helpers';

/**
 * Mock object representing a PIM TFM team.
 *
 * @constant
 * @property {string} id - The unique identifier for the PIM team, derived from TEAM_IDS.PIM.
 * @property {string} name - The name of the PIM team, derived from TEAM_IDS.PIM.
 * @property {string} email - The email address associated with the PIM team.
 */
export const MOCK_PIM_TEAM: Team = {
  id: TEAM_IDS.PIM,
  name: TEAM_IDS.PIM,
  email: MOCK_EMAIL,
};
