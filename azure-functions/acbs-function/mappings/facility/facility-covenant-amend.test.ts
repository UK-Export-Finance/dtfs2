import { facilityCovenantAmend } from './facility-covenant-amend';

describe('facilityCovenantAmend', () => {
  const aValidAmount = 123.456;
  const aValidAmountExpected = 123.46;
  const aValidGuaranteeExpiryDate = '2022-01-01';
  const aValidGuaranteeExpiryDateExpected = '2022-01-01';
  const aValidAmountRequest = { amount: aValidAmount };
  const aValidAmountExpectedResult = { targetAmount: aValidAmountExpected };
  const aValidGuaranteeExpiryDateRequest = { facilityGuaranteeDates: { guaranteeExpiryDate: aValidGuaranteeExpiryDate } };
  const aValidGuaranteeExpiryDateExpectedResult = { expirationDate: aValidGuaranteeExpiryDateExpected };
  const aValidAmountAndGuaranteeExpiryDateRequest = { ...aValidAmountRequest, ...aValidGuaranteeExpiryDateRequest };
  const aValidAmountAndGuaranteeExpiryDateExpectedResult = { ...aValidAmountExpectedResult, ...aValidGuaranteeExpiryDateExpectedResult };
  describe('when there is an amendment amount', () => {
    const amendment = aValidAmountRequest;

    it('returns the target amount rounded to 2 decimal places', () => {
      const result = facilityCovenantAmend(amendment);
      expect(result).toEqual(aValidAmountExpectedResult);
    });
  });

  describe('when there is a guarantee expiry date', () => {
    const amendment = aValidGuaranteeExpiryDateRequest;
    it('returns the guarantee expiry date', () => {
      const result = facilityCovenantAmend(amendment);
      expect(result).toEqual(aValidGuaranteeExpiryDateExpectedResult);
    });
  });

  describe('when there is an amendment amount and a guarantee expiry date', () => {
    const amendment = aValidAmountAndGuaranteeExpiryDateRequest;
    it('returns the target amount rounded to 2 decimal places and the guarantee expiry date', () => {
      const result = facilityCovenantAmend(amendment);
      expect(result).toEqual(aValidAmountAndGuaranteeExpiryDateExpectedResult);
    });
  });

  describe('when there is no amendment amount or guarantee expiry date', () => {
    const amendment = {};
    it('returns an empty object', () => {
      expect(() => facilityCovenantAmend(amendment)).toThrowError('Either amount or facilityGuaranteeDates.guaranteeExpiryDate is required.');
    });
  });

  describe('when there are extra fields', () => {
    const amendment = {
      ...aValidAmountAndGuaranteeExpiryDateRequest,
      extraField: 'extra field',
      facilityGuaranteeDates: { ...aValidAmountAndGuaranteeExpiryDateRequest.facilityGuaranteeDates, extraField: 'extra field' },
    };
    it('returns the target amount rounded to 2 decimal places and the guarantee expiry date', () => {
      const result = facilityCovenantAmend(amendment);
      expect(result).toEqual({ targetAmount: 123.46, expirationDate: '2022-01-01' });
    });
  });
});
