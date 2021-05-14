import CONSTANTS from '../../../../constants';
import { userIsInTeam } from '../../../../helpers/user';

export const userCanEditExporterCreditRating = (user) =>
  userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITING_SUPPORT);

export const canUserEditFacilityRiskProfile = (user) =>
  userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITERS)
  || userIsInTeam(user, CONSTANTS.TEAMS.UNDERWRITER_MANAGERS);
