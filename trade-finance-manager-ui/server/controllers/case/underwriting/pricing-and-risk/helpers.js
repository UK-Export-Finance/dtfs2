import CONSTANTS from '../../../../constants';
import { userIsInTeam } from '../../../../helpers/user';

// eslint-disable-next-line import/prefer-default-export
export const userCanEditGeneral = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);
