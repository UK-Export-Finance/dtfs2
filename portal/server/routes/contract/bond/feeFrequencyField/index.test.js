import feeFrequencyField from '.';

describe('feeFrequencyField', () => {
  describe('when body.feeType is `In advance`', () => {
    it('should return feeFrequency as body.inAdvanceFeeFrequency', () => {
      const mockBody = {
        feeType: 'In advance',
        inAdvanceFeeFrequency: 'Monthly',
      };

      const result = feeFrequencyField(mockBody);
      expect(result.feeFrequency).toEqual('Monthly');
    });
  });

  describe('when body.feeType is `In arrear`', () => {
    it('should return feeFrequency as body.inArrearFeeFrequency', () => {
      const mockBody = {
        feeType: 'In arrear',
        inArrearFeeFrequency: 'Monthly',
      };

      const result = feeFrequencyField(mockBody);
      expect(result.feeFrequency).toEqual('Monthly');
    });
  });

  describe('when body.feeFrequency exists', () => {
    it('should return feeFrequency as body.feeFrequency', () => {
      const mockBody = {
        feeFrequency: 'In arrear',
      };

      const result = feeFrequencyField(mockBody);
      expect(result.feeFrequency).toEqual(mockBody.feeFrequency);
    });
  });

  describe('when no body.feeType and body.feeFrequency and existingBond.feeFrequency exists', () => {
    it('should return feeFrequency as existingBond.feeFrequency', () => {
      const mockBody = {};
      const mockExistingBond = {
        _id: '1234',
        feeFrequency: 'Quarterly',
      };

      const result = feeFrequencyField(mockBody, mockExistingBond);
      expect(result.feeFrequency).toEqual(mockExistingBond.feeFrequency);
    });
  });

  describe('with no body feeType or feeFrequency in body or existingBond', () => {
    it('should return feeFrequency as empty string', () => {
      const mockBody = {};
      const mockExistingBond = {};

      const result = feeFrequencyField(mockBody, mockExistingBond);
      expect(result.feeFrequency).toEqual('');
    });
  });

  it('should delete inAdvanceFeeFrequency and inArrearFeeFrequency', () => {
    const mockBody = {
      feeType: 'In arrear',
      inArrearFeeFrequency: 'Monthly',
      inAdvanceFeeFrequency: 'Monthly',
    };

    const result = feeFrequencyField(mockBody);
    expect(result.inArrearFeeFrequency).toBeUndefined();
    expect(result.inAdvanceFeeFrequency).toBeUndefined();
  });
});
