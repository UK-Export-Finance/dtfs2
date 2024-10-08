const { FACILITY_TYPE } = require('@ukef/dtfs2-common');
const mapBankFacilityReference = require('./mapBankFacilityReference');

describe('mapBankFacilityReference', () => {
  const mockBond = {
    _id: '1234',
    ukefFacilityType: FACILITY_TYPE.BOND,
    name: 'abc123',
  };

  const mockLoan = {
    _id: '1234',
    ukefFacilityType: FACILITY_TYPE.LOAN,
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
