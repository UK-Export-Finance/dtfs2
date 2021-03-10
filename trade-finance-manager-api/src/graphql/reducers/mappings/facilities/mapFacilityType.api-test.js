const mapFacilityType = require('./mapFacilityType');
const { capitalizeFirstLetter } = require('../../../../utils/string');

describe('mapFacilityType', () => {
  describe('when facilityProduct.code is bond', () => {
    it('should return facility.bondType', () => {
      const mockBond = {
        bondType: 'Bid bond',
        facilityProduct: {
          code: 'BSS',
        },
      };

      const result = mapFacilityType(mockBond);
      expect(result).toEqual(mockBond.bondType);
    });
  });

  describe('when facility is a loan', () => {
    it('should capitalize facilityType', () => {
      const mockLoan = {
        bondType: null,
        facilityType: 'loan',
        facilityProduct: {
          code: 'EWCS',
        },
      };

      const result = mapFacilityType(mockLoan);

      expect(result).toEqual(capitalizeFirstLetter('loan'));
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
