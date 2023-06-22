import canAmendFacility from './canAmendFacility';
import { STATUS, USER_ROLES } from '../../constants';

describe('canAmendFacility', () => {
  it('should return true for a maker and acknowledged deal', () => {
    const deal = { status: STATUS.UKEF_ACKNOWLEDGED };
    const userRoles = [USER_ROLES.MAKER];

    expect(canAmendFacility(userRoles, deal)).toEqual(true);
  });

  it('should return false if user is not a maker', () => {
    const deal = { status: STATUS.UKEF_ACKNOWLEDGED };
    const userRoles = [USER_ROLES.CHECKER, USER_ROLES.ADMIN];

    expect(canAmendFacility(userRoles, deal)).toEqual(false);
  });

  it('should return false if deal is not acknowledged', () => {
    const deal = { status: STATUS.SUBMITTED_TO_UKEF };
    const userRoles = [USER_ROLES.MAKER];

    expect(canAmendFacility(userRoles, deal)).toEqual(false);
  });
});
