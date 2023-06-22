import canAmendFacility from './canAmendFacility';
import { FACILITY_STAGE, STATUS, USER_ROLES } from '../../constants';

describe('canAmendFacility', () => {
  it('should return true for a maker and acknowledged deal with an issued facility', () => {
    const userRoles = [USER_ROLES.MAKER];
    const deal = { status: STATUS.UKEF_ACKNOWLEDGED };
    const facility = { facilityStage: FACILITY_STAGE.ISSUED };

    expect(canAmendFacility(userRoles, deal, facility)).toEqual(true);
  });

  it('should return false if user is not a maker', () => {
    const userRoles = [USER_ROLES.CHECKER, USER_ROLES.ADMIN];
    const deal = { status: STATUS.UKEF_ACKNOWLEDGED };
    const facility = { facilityStage: FACILITY_STAGE.ISSUED };

    expect(canAmendFacility(userRoles, deal, facility)).toEqual(false);
  });

  it('should return false if deal is not acknowledged', () => {
    const userRoles = [USER_ROLES.MAKER];
    const deal = { status: STATUS.SUBMITTED_TO_UKEF };
    const facility = { facilityStage: FACILITY_STAGE.ISSUED };

    expect(canAmendFacility(userRoles, deal, facility)).toEqual(false);
  });

  it('should return false if facility is not issued', () => {
    const userRoles = [USER_ROLES.MAKER];
    const deal = { status: STATUS.UKEF_ACKNOWLEDGED };
    const facility = { facilityStage: FACILITY_STAGE.UNISSUED };

    expect(canAmendFacility(userRoles, deal, facility)).toEqual(false);
  });
});
