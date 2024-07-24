import { CURRENCY, Currency, PaymentMatchingToleranceEntity, PaymentMatchingToleranceEntityMockBuilder } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { when } from 'jest-when';
import { difference } from 'lodash';
import { getActivePaymentMatchingTolerances } from './payment-matching-tolerance-repo';
import { NotFoundError } from '../../errors';

describe('payment-matching-tolerance-repo', () => {
  const mockFindBy = jest.fn();
  const mockEntityManager = {
    findBy: mockFindBy,
  } as unknown as EntityManager;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getActivePaymentMatchingTolerances', () => {
    it('retrieves active tolerances', async () => {
      // Arrange
      when(mockFindBy)
        .calledWith(PaymentMatchingToleranceEntity, { isActive: true })
        .mockResolvedValue([
          PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withThreshold(1).build(),
          PaymentMatchingToleranceEntityMockBuilder.forCurrency('USD').withThreshold(2).build(),
          PaymentMatchingToleranceEntityMockBuilder.forCurrency('JPY').withThreshold(3).build(),
          PaymentMatchingToleranceEntityMockBuilder.forCurrency('EUR').withThreshold(4).build(),
        ]);

      // Act
      const result = await getActivePaymentMatchingTolerances(mockEntityManager);

      // Assert
      expect(result.GBP).toEqual(1);
      expect(result.USD).toEqual(2);
      expect(result.JPY).toEqual(3);
      expect(result.EUR).toEqual(4);
    });

    it.each(Object.values(CURRENCY))('throws a not found error if tolerance not found for currency %s', async (missingCurrency: Currency) => {
      // Arrange
      const activeCurrencies = difference(Object.values(CURRENCY), [missingCurrency]).map((currency) =>
        PaymentMatchingToleranceEntityMockBuilder.forCurrency(currency).build(),
      );
      when(mockFindBy).calledWith(PaymentMatchingToleranceEntity, { isActive: true }).mockResolvedValue(activeCurrencies);

      // Act + Assert
      await expect(getActivePaymentMatchingTolerances(mockEntityManager)).rejects.toThrow(NotFoundError);
    });
  });
});
