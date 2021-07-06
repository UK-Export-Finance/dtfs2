import CONSTANTS from '../../../../constants';
import { userIsInTeam } from '../../../../helpers/user';

const canUserEditLeadUnderwriter = (user) => {
  const isManager = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS]);

  if (isManager) {
    return true;
  }

  return false;
};

export default canUserEditLeadUnderwriter;
