const mapTenorDate = require('./mapTenorDate');

describe('Mapping tenor dates across products', () => {
  const mockGefFacility = {
    facilitySnapshot: {
      hasBeenIssued: true,
      monthsOfCover: 12,
    },
    tfm: {
      exposurePeriodInMonths: 12,
    },
  };

  const mockBssEwcsFacility = {
    facilitySnapshot: {
      hasBeenIssued: true,
      ukefGuaranteeInMonths: 12,
    },
    tfm: {
      exposurePeriodInMonths: 12,
    },
  };

  const mockGefFacilityUnissued = {
    facilitySnapshot: {
      hasBeenIssued: false,
      monthsOfCover: 21,
    },
    tfm: {
    },
  };

  const mockBssEwcsFacilityUnissued = {
    facilitySnapshot: {
      hasBeenIssued: false,
      ukefGuaranteeInMonths: 21,
    },
    tfm: {
    },
  };

  describe('Should return `exposurePeriod` if the facility is issued', () => {
    it('GEF', () => {
      const { facilitySnapshot, tfm } = mockGefFacility;
      const result = mapTenorDate(facilitySnapshot.hasBeenIssued, facilitySnapshot.monthsOfCover, tfm.exposurePeriodInMonths);
      const expected = `${tfm.exposurePeriodInMonths} months`;

      expect(result).toEqual(expected);
    });
    it('BSS/EWCS', () => {
      const { facilitySnapshot, tfm } = mockBssEwcsFacility;
      const result = mapTenorDate(facilitySnapshot.hasBeenIssued, facilitySnapshot.ukefGuaranteeInMonths, tfm.exposurePeriodInMonths);
      const expected = `${tfm.exposurePeriodInMonths} months`;

      expect(result).toEqual(expected);
    });
  });

  describe('Should return cover months if the facility is un-issued', () => {
    it('GEF', () => {
      const { facilitySnapshot, tfm } = mockGefFacilityUnissued;
      const result = mapTenorDate(facilitySnapshot.hasBeenIssued, facilitySnapshot.monthsOfCover, tfm.exposurePeriodInMonths);
      const expected = `${facilitySnapshot.monthsOfCover} months`;

      expect(result).toEqual(expected);
    });
    it('BSS/EWCS', () => {
      const { facilitySnapshot, tfm } = mockBssEwcsFacilityUnissued;
      const result = mapTenorDate(facilitySnapshot.hasBeenIssued, facilitySnapshot.ukefGuaranteeInMonths, tfm.exposurePeriodInMonths);
      const expected = `${facilitySnapshot.ukefGuaranteeInMonths} months`;

      expect(result).toEqual(expected);
    });
  });

  describe('Should return `null`', () => {
    it('When months are null', () => {
      const { facilitySnapshot, tfm } = mockGefFacilityUnissued;
      const result = mapTenorDate(facilitySnapshot.hasBeenIssued, null, tfm.exposurePeriodInMonths);

      expect(result).toEqual(null);
    });

    it('Upon void argument sets', () => {
      const { tfm } = mockGefFacilityUnissued;
      const result = mapTenorDate(null, null, tfm.exposurePeriodInMonths);

      expect(result).toEqual(null);
    });

    it('Upon void argument sets', () => {
      const result = mapTenorDate(null, null, null);

      expect(result).toEqual(null);
    });
  });
});
