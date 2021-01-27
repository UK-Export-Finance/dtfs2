const mapBankFacilityReference = require('./mapBankFacilityReference');

describe('mapBankFacilityReference', () => {
  const mockBond = {
    _id: '1234',
    bondType: 'Retention bond',
    bankReferenceNumber: 'abc123',
  };

  const mockLoan = {
    _id: '1234',
    interestMarginFee: '12',
    uniqueIdentificationNumber: '700',
  };

  describe('when facility is bond and has bankReferenceNumber', () => {
    it('should return bankReferenceNumber', () => {
      const result = mapBankFacilityReference(mockBond);
      expect(result).toEqual(mockBond.bankReferenceNumber);
    });
  });

  describe('when facility is loan and has uniqueIdentificationNumber', () => {
    it('should return uniqueIdentificationNumber', () => {
      const result = mapBankFacilityReference(mockLoan);
      expect(result).toEqual(mockLoan.uniqueIdentificationNumber);
    });
  });
});
