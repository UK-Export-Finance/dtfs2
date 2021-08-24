import CONSTANTS from '../../../constants';
import { userIsInTeam } from '../../../helpers/user';

const userCanEdit = (user) => userIsInTeam(user, [CONSTANTS.TEAMS.BUSINESS_SUPPORT]);

export default userCanEdit;
