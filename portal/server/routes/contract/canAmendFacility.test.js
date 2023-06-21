import canAmendFacility from './canAmendFacility';
import { USER_ROLES } from '../../constants';

describe('canAmendFacility', () => {
  it('should return true for a maker', () => {
    expect(canAmendFacility([USER_ROLES.MAKER])).toEqual(true);
  });

  it('should return false if user is not a maker', () => {
    expect(canAmendFacility([USER_ROLES.CHECKER, USER_ROLES.ADMIN])).toEqual(false);
  });
});
