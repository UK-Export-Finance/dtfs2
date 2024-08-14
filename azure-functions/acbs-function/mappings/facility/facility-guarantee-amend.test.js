const facilityGuaranteeAmend = require('./facility-guarantee-amend');

describe('facilityGuaranteeAmend', () => {
  describe('when there is an amendment amount', () => {
    const amendment = { amount: 123.456 };

    it('returns the target amount rounded to 2 decimal places', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({ targetAmount: 123.46 });
    });
  });

  describe('when there is a guarantee expiry date', () => {
    const amendment = { facilityGuaranteeDates: { guaranteeExpiryDate: '2022-01-01' } };
    it('returns the guarantee expiry date', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({ expirationDate: '2022-01-01' });
    });
  });

  describe('when there is an amendment amount and a guarantee expiry date', () => {
    const amendment = { amount: 123.456, facilityGuaranteeDates: { guaranteeExpiryDate: '2022-01-01' } };
    it('returns the target amount rounded to 2 decimal places and the guarantee expiry date', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({ targetAmount: 123.46, expirationDate: '2022-01-01' });
    });
  });

  describe('when there is no amendment amount or guarantee expiry date', () => {
    const amendment = {};
    const result = facilityGuaranteeAmend(amendment);
    expect(result).toEqual({});
  });

  describe('when there are extra fields', () => {
    const amendment = {
      amount: 123.456,
      facilityGuaranteeDates: { guaranteeExpiryDate: '2022-01-01', extraField: 'extra field' },
      extraField: 'extra field',
    };
    it('returns the target amount rounded to 2 decimal places and the guarantee expiry date', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({ targetAmount: 123.46, expirationDate: '2022-01-01' });
    });
  });
});
