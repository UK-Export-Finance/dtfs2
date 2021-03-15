const mapTenorDate = require('./mapTenorDate');

describe('mapTenorDate', () => {
  describe('when facilityStage is `Commitment`', () => {
    const mockFacilityTfm = {};

    it('should return facility.ukefGuaranteeInMonths', () => {
      const mockFacility = {
        facilityStage: 'Commitment',
        ukefGuaranteeInMonths: '11',
      };

      const result = mapTenorDate(mockFacility, mockFacilityTfm);

      const expected = `${mockFacility.ukefGuaranteeInMonths} months`;

      expect(result).toEqual(expected);
    });

    describe('when ukefGuaranteeInMonths is exactly 1', () => {
      it('should return `month` instead and not `months`', () => {
        const mockFacility = {
          facilityStage: 'Commitment',
          ukefGuaranteeInMonths: '1',
        };

        const result = mapTenorDate(mockFacility, mockFacilityTfm);

        const expected = `${mockFacility.ukefGuaranteeInMonths} month`;

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when facilityTfm has exposurePeriodInMonths', () => {
    const mockFacility = {
      facilityStage: 'Issued',
    };

    it('should return exposurePeriodInMonths', () => {
      const mockFacilityTfm = {
        exposurePeriodInMonths: 3,
      };

      const result = mapTenorDate(mockFacility, mockFacilityTfm);

      const expected = `${mockFacilityTfm.exposurePeriodInMonths} months`;

      expect(result).toEqual(expected);
    });

    describe('when exposurePeriodInMonths is exactly 1', () => {
      it('should return `month` instead and not `months`', () => {
        const mockFacilityTfm = {
          exposurePeriodInMonths: 1,
        };

        const result = mapTenorDate(mockFacility, mockFacilityTfm);

        const expected = `${mockFacilityTfm.exposurePeriodInMonths} month`;

        expect(result).toEqual(expected);
      });
    });
  });
});
