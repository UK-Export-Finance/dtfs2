const wasPreviouslyUnissued = require('./was-previously-unissued');
const CONSTANTS = require('../../constants');

describe('check if facility has changed from unissued to issued', () => {
  describe('bond', () => {
    const mockIssuedBond = {
      facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED,
    };

    describe('when previousFacilityStage does not exist', () => {
      it('should return false', () => {
        const result = wasPreviouslyUnissued(mockIssuedBond);
        expect(result).toEqual(false);
      });
    });

    describe('when previousFacilityStage is issued', () => {
      it('should return false', () => {
        const result = wasPreviouslyUnissued({
          ...mockIssuedBond,
          previousFacilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED,
        });
        expect(result).toEqual(false);
      });
    });

    describe('when previousFacilityStage is issued and facilityStage is issued', () => {
      it('should return false', () => {
        const result = wasPreviouslyUnissued({
          ...mockIssuedBond,
          previousFacilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED,
        });
        expect(result).toEqual(false);
      });
    });

    describe('when previousFacilityStage is unissued and facilityStage is issued', () => {
      it('should return true', () => {
        const result = wasPreviouslyUnissued({
          ...mockIssuedBond,
          previousFacilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED,
        });
        expect(result).toEqual(true);
      });
    });
  });

  describe('loan', () => {
    const mockIssuedLoan = {
      facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL,
    };

    describe('when previousFacilityStage does not exist', () => {
      it('should return false', () => {
        const result = wasPreviouslyUnissued(mockIssuedLoan);
        expect(result).toEqual(false);
      });
    });

    describe('when previousFacilityStage is unconditional', () => {
      it('should return false', () => {
        const result = wasPreviouslyUnissued({
          ...mockIssuedLoan,
          previousFacilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL,
        });
        expect(result).toEqual(false);
      });
    });

    describe('when previousFacilityStage is unconditional and facilityStage is unconditional', () => {
      it('should return false', () => {
        const result = wasPreviouslyUnissued({
          ...mockIssuedLoan,
          previousFacilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL,
        });
        expect(result).toEqual(false);
      });
    });

    describe('when previousFacilityStage is unissued and facilityStage is unconditional', () => {
      it('should return true', () => {
        const result = wasPreviouslyUnissued({
          ...mockIssuedLoan,
          previousFacilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL,
        });
        expect(result).toEqual(true);
      });
    });
  });
});
