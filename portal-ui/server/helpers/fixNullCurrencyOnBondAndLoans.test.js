import { fixNullCurrencyOnBondAndLoans } from './fixNullCurrencyOnBondAndLoans';
import api from '../api';
import postToApi from './postToApi';

jest.mock('./postToApi');

const supplyContractCurrency = { id: 'USD', text: 'US Dollar' };
const dealId = '12345';
const userToken = 'token';

describe('fixNullCurrencyOnBondAndLoans', () => {
  const mockPostToApi = postToApi;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPostToApi.mockReturnValue(true);
  });

  describe('when no loans or bonds have null currency where currencySameAsSupplyContractCurrency is true', () => {
    it('should not call postToApi', async () => {
      const bonds = [{ _id: '1', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency }];
      const loans = [{ _id: '3', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency }];

      await fixNullCurrencyOnBondAndLoans(bonds, loans, supplyContractCurrency, dealId, userToken);

      expect(mockPostToApi).not.toHaveBeenCalled();
    });
  });

  describe('when loans and bonds have null currency where currencySameAsSupplyContractCurrency is true', () => {
    it('should call postToApi for each loan and bond with null currency where currencySameAsSupplyContractCurrency is true', async () => {
      const bonds = [
        { _id: '1', currencySameAsSupplyContractCurrency: 'true', currency: null },
        { _id: '2', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency },
      ];
      const loans = [
        { _id: '3', currencySameAsSupplyContractCurrency: 'true', currency: null },
        { _id: '4', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency },
      ];

      await fixNullCurrencyOnBondAndLoans(bonds, loans, supplyContractCurrency, dealId, userToken);

      expect(mockPostToApi).toHaveBeenCalledTimes(2);
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateBond(dealId, bonds[0]._id, { currency: supplyContractCurrency }, userToken));
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateLoan(dealId, loans[0]._id, { currency: supplyContractCurrency }, userToken));
    });
  });

  describe('when there are only loans with null currency where currencySameAsSupplyContractCurrency is true', () => {
    it('should call postToApi for each loan with null currency where currencySameAsSupplyContractCurrency is true', async () => {
      const bonds = [{ _id: '1', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency }];
      const loans = [
        { _id: '3', currencySameAsSupplyContractCurrency: 'true', currency: null },
        { _id: '4', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency },
      ];

      await fixNullCurrencyOnBondAndLoans(bonds, loans, supplyContractCurrency, dealId, userToken);

      expect(mockPostToApi).toHaveBeenCalledTimes(1);
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateLoan(dealId, loans[0]._id, { currency: supplyContractCurrency }, userToken));
    });
  });

  describe('when there are only bonds with null currency where currencySameAsSupplyContractCurrency is true', () => {
    it('should call postToApi for each bond with null currency where currencySameAsSupplyContractCurrency is true', async () => {
      const bonds = [
        { _id: '1', currencySameAsSupplyContractCurrency: 'true', currency: null },
        { _id: '2', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency },
      ];
      const loans = [{ _id: '3', currencySameAsSupplyContractCurrency: 'true', currency: supplyContractCurrency }];

      await fixNullCurrencyOnBondAndLoans(bonds, loans, supplyContractCurrency, dealId, userToken);

      expect(mockPostToApi).toHaveBeenCalledTimes(1);
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateBond(dealId, bonds[0]._id, { currency: supplyContractCurrency }, userToken));
    });
  });

  describe('when there are multiple loans and bonds with null currency where currencySameAsSupplyContractCurrency is true', () => {
    it('should call postToApi for each loan and bond with null currency where currencySameAsSupplyContractCurrency is true', async () => {
      const bonds = [
        { _id: '1', currencySameAsSupplyContractCurrency: 'true', currency: null },
        { _id: '2', currencySameAsSupplyContractCurrency: 'true', currency: null },
      ];
      const loans = [
        { _id: '3', currencySameAsSupplyContractCurrency: 'true', currency: null },
        { _id: '4', currencySameAsSupplyContractCurrency: 'true', currency: null },
      ];

      await fixNullCurrencyOnBondAndLoans(bonds, loans, supplyContractCurrency, dealId, userToken);

      expect(mockPostToApi).toHaveBeenCalledTimes(4);
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateBond(dealId, bonds[0]._id, { currency: supplyContractCurrency }, userToken));
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateBond(dealId, bonds[1]._id, { currency: supplyContractCurrency }, userToken));
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateLoan(dealId, loans[0]._id, { currency: supplyContractCurrency }, userToken));
      expect(mockPostToApi).toHaveBeenCalledWith(api.updateLoan(dealId, loans[1]._id, { currency: supplyContractCurrency }, userToken));
    });
  });

  describe('when there are no loans or bonds', () => {
    it('should not call postToApi', async () => {
      await fixNullCurrencyOnBondAndLoans([], [], supplyContractCurrency, dealId, userToken);

      expect(mockPostToApi).not.toHaveBeenCalled();
    });
  });
});
