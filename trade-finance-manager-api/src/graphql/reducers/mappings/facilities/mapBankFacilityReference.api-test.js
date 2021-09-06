const mapBankFacilityReference = require('./mapBankFacilityReference');
const CONSTANTS = require('../../../../constants');

describe('mapBankFacilityReference', () => {
  const mockBond = {
    _id: '1234',
    ukefFacilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
    uniqueIdentificationNumber: 'abc123',
  };

  const mockLoan = {
    _id: '1234',
    ukefFacilityType: CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN,
    bankReferenceNumber: '700',
  };

  describe('when facility is bond', () => {
    it('should return uniqueIdentificationNumber', () => {
      const result = mapBankFacilityReference(mockBond);
      expect(result).toEqual(mockBond.uniqueIdentificationNumber);
    });
  });

  describe('when facility is loan', () => {
    it('should return bankReferenceNumber', () => {
      const result = mapBankFacilityReference(mockLoan);
      expect(result).toEqual(mockLoan.bankReferenceNumber);
    });
  });

  it('should return null', () => {
    const result = mapBankFacilityReference({});
    expect(result).toEqual(null);
  });
});
