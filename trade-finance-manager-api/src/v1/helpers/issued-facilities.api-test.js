const { issuedFacilities } = require('./issued-facilities');
const CONSTANTS = require('../../constants');

const issuedBond = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED,
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const issuedLoan = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL,
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const unissuedBond = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED,
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const unissuedLoan = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL,
  facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
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

    it.only('should return correct issued/unissued facilities', () => {
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
