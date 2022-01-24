const isFacilityValidForPremiumSchedule = require('./is-facility-valid-for-premium-schedule');
const CONSTANTS = require('../../constants');

const facility = {
  type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
  feeType: 'At maturity',
  ukefFacilityId: 1234,
  guaranteeFee: 10,
  coverPercentage: 80,
  dayCountBasis: 2,
  ukefExposure: 60,
};

const exposurePeriod = 2;
const facilityGuaranteeDates = {
  guaranteeCommencementDate: '2021-01-01',
  guaranteeExpiryDate: '2023-02-03',
};

describe('isFacilityValidForPremiumSchedule', () => {
  it('should return true for valid facility', () => {
    const result = isFacilityValidForPremiumSchedule(facility, exposurePeriod, facilityGuaranteeDates);
    expect(result).toEqual(true);
  });

  describe('invalid facility', () => {
    describe('facility exposure period', () => {
      it('should be invalid if no exposure period', () => {
        const result = isFacilityValidForPremiumSchedule({}, '', '');
        expect(result).toEqual(false);
      });

      it('should be invalid if exposure period < 1', () => {
        const result = isFacilityValidForPremiumSchedule({}, 0.5, '');
        expect(result).toEqual(false);
      });
    });

    describe('feeType', () => {
      it('should be invalid if no feeType', () => {
        const invalidFacility = {
          ...facility,
          feeType: '',
        };
        const result = isFacilityValidForPremiumSchedule(invalidFacility, exposurePeriod, facilityGuaranteeDates);
        expect(result).toEqual(false);
      });
    });

    describe('ukefFacilityId', () => {
      it('should be invalid if no ukefFacilityId', () => {
        const invalidFacility = {
          ...facility,
          ukefFacilityId: '',
        };
        const result = isFacilityValidForPremiumSchedule(invalidFacility, exposurePeriod, facilityGuaranteeDates);
        expect(result).toEqual(false);
      });
    });

    describe('facility guarantee dates', () => {
      it('should be invalid if no guarantee commencement date', () => {
        const invalidFacilityGuaranteeDates = {
          ...facilityGuaranteeDates,
          guaranteeCommencementDate: '',
        };
        const result = isFacilityValidForPremiumSchedule(facility, exposurePeriod, invalidFacilityGuaranteeDates);
        expect(result).toEqual(false);
      });

      it('should be invalid if no guarantee expiry date', () => {
        const invalidFacilityGuaranteeDates = {
          ...facilityGuaranteeDates,
          guaranteeExpiryDate: '',
        };
        const result = isFacilityValidForPremiumSchedule(facility, exposurePeriod, invalidFacilityGuaranteeDates);
        expect(result).toEqual(false);
      });
    });

    describe('guaranteeFee', () => {
      it('should be invalid if no guaranteeFee', () => {
        const invalidFacility = {
          ...facility,
          guaranteeFee: '',
        };
        const result = isFacilityValidForPremiumSchedule(invalidFacility, exposurePeriod, facilityGuaranteeDates);
        expect(result).toEqual(false);
      });
    });

    describe('coverPercentage', () => {
      it('should be invalid if no coverPercentage', () => {
        const invalidFacility = {
          ...facility,
          coverPercentage: '',
        };
        const result = isFacilityValidForPremiumSchedule(invalidFacility, exposurePeriod, facilityGuaranteeDates);
        expect(result).toEqual(false);
      });
    });

    describe('dayCountBasis', () => {
      it('should be invalid if no dayCountBasis', () => {
        const invalidFacility = {
          ...facility,
          dayCountBasis: '',
        };
        const result = isFacilityValidForPremiumSchedule(invalidFacility, exposurePeriod, facilityGuaranteeDates);
        expect(result).toEqual(false);
      });
    });

    describe('ukefExposure', () => {
      it('should be invalid if no ukefExposure', () => {
        const invalidFacility = {
          ...facility,
          ukefExposure: '',
        };
        const result = isFacilityValidForPremiumSchedule(invalidFacility, exposurePeriod, facilityGuaranteeDates);
        expect(result).toEqual(false);
      });
    });
  });
});
