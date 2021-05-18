import CONSTANTS from '../../../../constants';
import { userIsInTeam } from '../../../../helpers/user';

export const userCanEditExporterCreditRating = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITING_SUPPORT]);

export const userCanEditGeneral = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITERS, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);
