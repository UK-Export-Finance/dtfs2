const { issuedFacilities } = require('./issued-facilities');
const CONSTANTS = require('../../constants');

const issuedBond = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  hasBeenIssued: true,
};

const issuedLoan = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  hasBeenIssued: true,
};

const unissuedBond = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  hasBeenIssued: false,
};

const unissuedLoan = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  hasBeenIssued: false,
};

describe('return list of issued & unissued facilities', () => {
  describe('with facilitySnapshot', () => {
    let facilities;
    beforeAll(() => {
      facilities = [
        issuedBond,
        unissuedBond,
        issuedLoan,
        unissuedLoan,
      ];
    });

    it('should return correct issued/unissued facilities', () => {
      const {
        issuedBonds,
        unissuedBonds,
        issuedLoans,
        unissuedLoans,
      } = issuedFacilities(facilities);

      expect(issuedBonds).toEqual([issuedBond]);
      expect(unissuedBonds).toEqual([unissuedBond]);
      expect(unissuedLoans).toEqual([unissuedLoan]);
      expect(issuedLoans).toEqual([issuedLoan]);
    });
  });

  describe('empty list when necessary', () => {
    let facilities;
    beforeAll(() => {
      facilities = [
        issuedBond,
        unissuedLoan,
      ];
    });

    it('should return correct issued/unissued facilities', () => {
      const {
        issuedBonds,
        unissuedBonds,
        issuedLoans,
        unissuedLoans,
      } = issuedFacilities(facilities);

      expect(issuedBonds).toEqual([issuedBond]);
      expect(unissuedBonds).toEqual([]);
      expect(unissuedLoans).toEqual([unissuedLoan]);
      expect(issuedLoans).toEqual([]);
    });
  });
});
