const { to2Decimals } = require('../../helpers/currency');
const facilityGuaranteeAmend = require('./facility-guarantee-amend');

jest.mock('../../helpers/currency', () => ({
  to2Decimals: jest.fn(),
}));

describe('facilityGuaranteeAmend', () => {
  const to2DecimalsResponse = 'to2DecimalsResponse';
  beforeEach(() => {
    jest.resetAllMocks();
    to2Decimals.mockImplementation(() => to2DecimalsResponse);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('when there is an amendment amount', () => {
    const amendment = { amount: 123.456 };
    it('calls to2Decimals with the amendment amount', () => {
      facilityGuaranteeAmend(amendment);
      expect(to2Decimals).toHaveBeenCalledWith(123.456);
    });

    it('returns the result of to2Decimals to guaranteedLimit', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({ guaranteedLimit: to2DecimalsResponse });
    });
  });

  describe('when there is a facilityGuaranteeDates object', () => {
    describe('when there is not a guarantee expiry date', () => {
      it('returns an empty object', () => {
        const amendment = { facilityGuaranteeDates: {} };
        const result = facilityGuaranteeAmend(amendment);
        expect(result).toEqual({});
      });
    });

    describe('when there is a guarantee expiry date', () => {
      it('returns the guarantee expiry date', () => {
        const amendment = { facilityGuaranteeDates: { guaranteeExpiryDate: '2022-01-01' } };
        const result = facilityGuaranteeAmend(amendment);
        expect(result).toEqual({ expirationDate: '2022-01-01' });
      });
    });
  });

  describe('when there is an amendment amount and a guarantee expiry date', () => {
    const amendment = { amount: 123.456, facilityGuaranteeDates: { guaranteeExpiryDate: '2022-01-01' } };
    it('returns the target amount rounded to 2 decimal places and the guarantee expiry date', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({ guaranteedLimit: to2DecimalsResponse, expirationDate: '2022-01-01' });
    });
  });

  describe('when there is no amendment amount or guarantee expiry date', () => {
    const amendment = {};
    it('returns an empty object', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({});
    });
  });

  describe('when there are extra fields', () => {
    const amendment = {
      amount: 123.456,
      facilityGuaranteeDates: { guaranteeExpiryDate: '2022-01-01', extraField: 'extra field' },
      extraField: 'extra field',
    };
    it('returns the target amount rounded to 2 decimal places and the guarantee expiry date', () => {
      const result = facilityGuaranteeAmend(amendment);
      expect(result).toEqual({ guaranteedLimit: to2DecimalsResponse, expirationDate: '2022-01-01' });
    });
  });
});
