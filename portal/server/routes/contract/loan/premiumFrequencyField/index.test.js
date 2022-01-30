import premiumFrequencyField from '.';

describe('premiumFrequencyField', () => {
  describe('when body.premiumType is `In advance`', () => {
    it('should return feeFrequency as body.inAdvancePremiumFrequency', () => {
      const mockBody = {
        premiumType: 'In advance',
        inAdvancePremiumFrequency: 'Monthly',
      };

      const result = premiumFrequencyField(mockBody);
      expect(result.premiumFrequency).toEqual('Monthly');
    });
  });

  describe('when body.premiumType is `In arrear`', () => {
    it('should return feeFrequency as body.inArrearPremiumFrequency', () => {
      const mockBody = {
        premiumType: 'In arrear',
        inArrearPremiumFrequency: 'Monthly',
      };

      const result = premiumFrequencyField(mockBody);
      expect(result.premiumFrequency).toEqual('Monthly');
    });
  });

  describe('when body.feeFrequency exists', () => {
    it('should return feeFrequency as body.feeFrequency', () => {
      const mockBody = {
        premiumType: 'In arrear',
      };

      const result = premiumFrequencyField(mockBody);
      expect(result.premiumFrequency).toEqual(mockBody.feeFrequency);
    });
  });

  describe('when no body.premiumType and body.feeFrequency and existingLoan.feeFrequency exists', () => {
    it('should return feeFrequency as existingLoan.feeFrequency', () => {
      const mockBody = {};
      const mockExistingLoan = {
        _id: '1234',
        premiumFrequency: 'Quarterly',
      };

      const result = premiumFrequencyField(mockBody, mockExistingLoan);
      expect(result.premiumFrequency).toEqual(mockExistingLoan.premiumFrequency);
    });
  });

  describe('with no body premiumType or feeFrequency in body or existingLoan', () => {
    it('should return feeFrequency as empty string', () => {
      const mockBody = {};
      const mockExistingLoan = {};

      const result = premiumFrequencyField(mockBody, mockExistingLoan);
      expect(result.premiumFrequency).toEqual('');
    });
  });

  it('should delete inAdvancePremiumFrequency and inArrearPremiumFrequency', () => {
    const mockBody = {
      premiumType: 'In arrear',
      inArrearPremiumFrequency: 'Monthly',
      inAdvancePremiumFrequency: 'Monthly',
    };

    const result = premiumFrequencyField(mockBody);
    expect(result.inArrearPremiumFrequency).toBeUndefined();
    expect(result.inAdvancePremiumFrequency).toBeUndefined();
  });
});
