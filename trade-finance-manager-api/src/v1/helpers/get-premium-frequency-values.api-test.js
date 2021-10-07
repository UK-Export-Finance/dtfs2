const { getPremiumFrequencyId, getPremiumTypeId } = require('./get-premium-frequency-values');
const CONSTANTS = require('../../constants');

describe('get-premium-frequency-values', () => {
  describe('getPremiumFrequencyId', () => {
    describe('bonds', () => {
      const facility = {
        facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
      };

      it('should return monthly frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.MONTHLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.MONTHLY);
      });

      it('should return quartely frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.QUARTERLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.QUARTERLY);
      });

      it('should return semi-annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.SEMI_ANNUALLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.SEMI_ANNUALLY);
      });

      it('should return annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.ANNUALLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.ANNUALLY);
      });

      it('should return undefined if frequency not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: '999',
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.UNDEFINED);
      });
    });

    describe('loans', () => {
      const facility = {
        facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
      };

      it('should return monthly frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.MONTHLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.MONTHLY);
      });

      it('should return quartely frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.QUARTERLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.QUARTERLY);
      });

      it('should return semi-annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.SEMI_ANNUALLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.SEMI_ANNUALLY);
      });

      it('should return annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.ANNUALLY,
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.ANNUALLY);
      });

      it('should return undefined if frequency not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: '999',
        };

        const frequencyId = getPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.UNDEFINED);
      });
    });
  });

  describe('getPremiumTypeId', () => {
    describe('bonds', () => {
      const facility = {
        facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
      };

      it('should return In Advance fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ADVANCE,
        };

        const frequencyType = getPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ADVANCE);
      });

      it('should return In Arrears fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ARREARS,
        };

        const frequencyType = getPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ARREARS);
      });

      it('should return At Maturity fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.AT_MATURITY,
        };

        const frequencyType = getPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.AT_MATURITY);
      });

      it('should return 0 if frequency type not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeType: '999',
        };

        const frequencyId = getPremiumTypeId(frequencyFacility);
        expect(frequencyId).toEqual(0);
      });
    });

    describe('loans', () => {
      const facility = {
        facilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
      };

      it('should return In Advance fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ADVANCE,
        };

        const frequencyType = getPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ADVANCE);
      });

      it('should return In Arrears fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ARREARS,
        };

        const frequencyType = getPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ARREARS);
      });

      it('should return At Maturity fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.AT_MATURITY,
        };

        const frequencyType = getPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.AT_MATURITY);
      });

      it('should return 0 if frequency type not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeType: '999',
        };

        const frequencyId = getPremiumTypeId(frequencyFacility);
        expect(frequencyId).toEqual(0);
      });
    });
  });
});
