const { mapPremiumFrequencyId, mapPremiumTypeId } = require('./map-premium-ids');
const CONSTANTS = require('../../../constants');

describe('map-premium-ids', () => {
  describe('mapPremiumFrequencyId', () => {
    describe('bonds', () => {
      const facility = {
        type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
      };

      it('should return monthly frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.MONTHLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.MONTHLY);
      });

      it('should return quartely frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.QUARTERLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.QUARTERLY);
      });

      it('should return semi-annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.SEMI_ANNUALLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.SEMI_ANNUALLY);
      });

      it('should return annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.ANNUALLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.ANNUALLY);
      });

      it('should return undefined if frequency not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: '999',
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.UNDEFINED);
      });
    });

    describe('loans', () => {
      const facility = {
        type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
      };

      it('should return monthly frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.MONTHLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.MONTHLY);
      });

      it('should return quartely frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.QUARTERLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.QUARTERLY);
      });

      it('should return semi-annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.SEMI_ANNUALLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.SEMI_ANNUALLY);
      });

      it('should return annual frequencyId', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.ANNUALLY,
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.ANNUALLY);
      });

      it('should return undefined if frequency not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeFrequency: '999',
        };

        const frequencyId = mapPremiumFrequencyId(frequencyFacility);
        expect(frequencyId).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.UNDEFINED);
      });
    });
  });

  describe('mapPremiumTypeId', () => {
    describe('bonds', () => {
      const facility = {
        type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
      };

      it('should return In Advance fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ADVANCE,
        };

        const frequencyType = mapPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ADVANCE);
      });

      it('should return In Arrears fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ARREARS,
        };

        const frequencyType = mapPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ARREARS);
      });

      it('should return At Maturity fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.AT_MATURITY,
        };

        const frequencyType = mapPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.AT_MATURITY);
      });

      it('should return 0 if frequency type not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeType: '999',
        };

        const frequencyId = mapPremiumTypeId(frequencyFacility);
        expect(frequencyId).toEqual(0);
      });
    });

    describe('loans', () => {
      const facility = {
        type: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
      };

      it('should return In Advance fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ADVANCE,
        };

        const frequencyType = mapPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ADVANCE);
      });

      it('should return In Arrears fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ARREARS,
        };

        const frequencyType = mapPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ARREARS);
      });

      it('should return At Maturity fee type', () => {
        const frequencyFacility = {
          ...facility,
          feeType: CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.AT_MATURITY,
        };

        const frequencyType = mapPremiumTypeId(frequencyFacility);
        expect(frequencyType).toEqual(CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.AT_MATURITY);
      });

      it('should return 0 if frequency type not recognised', () => {
        const frequencyFacility = {
          ...facility,
          feeType: '999',
        };

        const frequencyId = mapPremiumTypeId(frequencyFacility);
        expect(frequencyId).toEqual(0);
      });
    });
  });
});
