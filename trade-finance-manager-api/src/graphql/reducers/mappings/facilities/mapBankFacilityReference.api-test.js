const mapBankFacilityReference = require('./mapBankFacilityReference');
const CONSTANTS = require('../../../../constants');

describe('mapBankFacilityReference', () => {
  const mockBond = {
    _id: '1234',
    ukefFacilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
    name: 'abc123',
  };

  const mockLoan = {
    _id: '1234',
    ukefFacilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
    name: '700',
  };

  describe('when facility is bond', () => {
    it('should return name', () => {
      const result = mapBankFacilityReference(mockBond);
      expect(result).toEqual(mockBond.name);
    });
  });

  describe('when facility is loan', () => {
    it('should return name', () => {
      const result = mapBankFacilityReference(mockLoan);
      expect(result).toEqual(mockLoan.name);
    });
  });

  it('should return null', () => {
    const result = mapBankFacilityReference({});
    expect(result).toEqual(null);
  });
});
