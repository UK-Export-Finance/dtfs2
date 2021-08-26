const isIssued = require('./is-issued');
const CONSTANTS = require('../../constants');

describe('check if facility is issued', () => {
  it('should return true if facilty is issued', () => {
    const facilityIsIssued = isIssued(CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED);
    expect(facilityIsIssued).toEqual(true);
  });

  it('should return true if facilty is unconditional', () => {
    const facilityIsIssued = isIssued(CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL);
    expect(facilityIsIssued).toEqual(true);
  });

  it('should return true if facilty is unissued', () => {
    const facilityIsIssued = isIssued(CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED);
    expect(facilityIsIssued).toEqual(false);
  });

  it('should return false if facilty is conditional', () => {
    const facilityIsIssued = isIssued(CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL);
    expect(facilityIsIssued).toEqual(false);
  });
});
