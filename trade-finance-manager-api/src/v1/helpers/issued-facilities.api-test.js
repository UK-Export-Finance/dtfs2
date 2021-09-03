const { issuedFacilities } = require('./issued-facilities');
const CONSTANTS = require('../../constants');

const issuedBondFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  hasBeenIssued: true,
};

const issuedLoanFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  hasBeenIssued: true,
};

const unissuedBondFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  hasBeenIssued: false,
};

const unissuedLoanFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  hasBeenIssued: false,
};

const issuedCashFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
  hasBeenIssued: true,
};

const unissuedCashFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
  hasBeenIssued: false,
};

const issuedContingentFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
  hasBeenIssued: true,
};

const unissuedContingentFacility = {
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
  hasBeenIssued: false,
};

describe('return list of issued & unissued facilities', () => {
  describe('with facilitySnapshot', () => {
    let facilities;
    beforeAll(() => {
      facilities = [
        issuedBondFacility,
        unissuedBondFacility,
        issuedLoanFacility,
        unissuedLoanFacility,
        issuedCashFacility,
        unissuedCashFacility,
        issuedContingentFacility,
        unissuedContingentFacility,
      ];
    });

    it('should return correct issued/unissued facilities', () => {
      const {
        issuedBonds,
        unissuedBonds,
        issuedLoans,
        unissuedLoans,
        issuedCash,
        unissuedCash,
        issuedContingent,
        unissuedContingent,
      } = issuedFacilities(facilities);

      expect(issuedBonds).toEqual([issuedBondFacility]);
      expect(unissuedBonds).toEqual([unissuedBondFacility]);
      expect(unissuedLoans).toEqual([unissuedLoanFacility]);
      expect(issuedLoans).toEqual([issuedLoanFacility]);

      expect(issuedCash).toEqual([issuedCashFacility]);
      expect(unissuedCash).toEqual([unissuedCashFacility]);
      expect(issuedContingent).toEqual([issuedContingentFacility]);
      expect(unissuedContingent).toEqual([unissuedContingentFacility]);
    });
  });

  describe('empty list when necessary', () => {
    let facilities;
    beforeAll(() => {
      facilities = [
        issuedBondFacility,
        unissuedLoanFacility,
      ];
    });

    it('should return correct issued/unissued facilities', () => {
      const {
        issuedBonds,
        unissuedBonds,
        issuedLoans,
        unissuedLoans,
      } = issuedFacilities(facilities);

      expect(issuedBonds).toEqual([issuedBondFacility]);
      expect(unissuedBonds).toEqual([]);
      expect(unissuedLoans).toEqual([unissuedLoanFacility]);
      expect(issuedLoans).toEqual([]);
    });
  });
});
