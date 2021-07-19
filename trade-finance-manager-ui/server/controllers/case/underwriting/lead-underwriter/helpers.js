import CONSTANTS from '../../../../constants';
import { userIsInTeam } from '../../../../helpers/user';

const canUserEditLeadUnderwriter = (user) =>
  userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

export default canUserEditLeadUnderwriter;
