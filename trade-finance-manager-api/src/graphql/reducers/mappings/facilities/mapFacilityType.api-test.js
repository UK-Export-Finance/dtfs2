const mapFacilityType = require('./mapFacilityType');
const { capitalizeFirstLetter } = require('../../../../utils/string');

describe('mapFacilityType', () => {
  describe('when facilityProduct.code is bond', () => {
    it('should return facility.bondType', () => {
      const mockBondFacility = {
        bondType: 'Bid bond',
        facilityProduct: {
          code: 'BSS',
        },
      };

      const result = mapFacilityType(mockBondFacility);
      expect(result).toEqual(mockBondFacility.bondType);
    });
  });

  describe('when facility is a loan', () => {
    it('should capitalize facilityType', () => {
      const mockLoanFacility = {
        bondType: null,
        facilityType: 'loan',
        facilityProduct: {
          code: 'EWCS',
        },
      };

      const result = mapFacilityType(mockLoanFacility);

      expect(result).toEqual(capitalizeFirstLetter('loan'));
    });
  });


  describe('when facility is CASH', () => {
    it('should return `Cash facility`', () => {
      const mockCashFacility = {
        facilityType: 'CASH',
        facilityProduct: {
          code: 'GEF',
          name: 'Cash',
        },
      };

      const result = mapFacilityType(mockCashFacility);

      expect(result).toEqual('Cash facility');
    });
  });

  describe('when facility is CONTINGENT', () => {
    it('should return `Contingent facility`', () => {
      const mockContingentFacility = {
        facilityType: 'CONTINGENT',
        facilityProduct: {
          code: 'GEF',
          name: 'Contingent',
        },
      };

      const result = mapFacilityType(mockContingentFacility);

      expect(result).toEqual('Contingent facility');
    });
  });

  it('should return null', () => {
    const mockFacility = {
      facilityProduct: {
        code: 'TEST',
      },
    };

    const result = mapFacilityType(mockFacility);
    expect(result).toEqual(null);
  });
});
