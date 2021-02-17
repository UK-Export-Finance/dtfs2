const mapBankFacilityReference = require('./mapBankFacilityReference');

describe('mapBankFacilityReference', () => {
  const mockBond = {
    _id: '1234',
    bondType: 'Retention bond',
    uniqueIdentificationNumber: 'abc123',
  };

  const mockLoan = {
    _id: '1234',
    interestMarginFee: '12',
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
});
