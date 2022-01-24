const { issuedFacilities } = require('./issued-facilities');
const CONSTANTS = require('../../constants');

const issuedBondFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  hasBeenIssued: true,
};

const issuedLoanFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  hasBeenIssued: true,
};

const unissuedBondFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  hasBeenIssued: false,
};

const unissuedLoanFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  hasBeenIssued: false,
};

const issuedCashFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
  hasBeenIssued: true,
};

const unissuedCashFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH,
  hasBeenIssued: false,
};

const issuedContingentFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
  hasBeenIssued: true,
};

const unissuedContingentFacility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.CONTINGENT,
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
