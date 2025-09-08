import { CURRENCY, PaymentMatchingToleranceEntityMockBuilder } from '@ukef/dtfs2-common';
import { PaymentMatchingToleranceRepo } from '../../repositories/payment-matching-tolerance-repo';
import { PaymentMatchingToleranceService } from './payment-matching-tolerance.service';
import { NotFoundError } from '../../errors';

jest.mock('../../repositories/payment-matching-tolerance-repo');

describe('PaymentMatchingToleranceService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getActiveGbpPaymentMatchingTolerance', () => {
    it(`should throw a NotFoundError if no active tolerance for ${CURRENCY.GBP} can be found`, async () => {
      // Arrange
      jest.spyOn(PaymentMatchingToleranceRepo, 'findOneByCurrencyAndIsActiveTrue').mockResolvedValue(null);

      // Act + Assert
      await expect(() => PaymentMatchingToleranceService.getGbpPaymentMatchingTolerance()).rejects.toThrow(
        new NotFoundError(`No active payment matching tolerance found for currency ${CURRENCY.GBP}`),
      );
    });

    it(`should retrieve the current active threshold for ${CURRENCY.GBP} payment matching tolerance`, async () => {
      // Arrange
      const gbpToleranceEntity = PaymentMatchingToleranceEntityMockBuilder.forCurrency(CURRENCY.GBP).withIsActive(true).withThreshold(1.23).build();
      const findOneByCurrencyAndIsActiveTrueSpy = jest
        .spyOn(PaymentMatchingToleranceRepo, 'findOneByCurrencyAndIsActiveTrue')
        .mockResolvedValue(gbpToleranceEntity);

      // Act
      await PaymentMatchingToleranceService.getGbpPaymentMatchingTolerance();

      // Assert
      expect(findOneByCurrencyAndIsActiveTrueSpy).toHaveBeenCalledTimes(1);
      expect(findOneByCurrencyAndIsActiveTrueSpy).toHaveBeenCalledWith(CURRENCY.GBP);
    });

    it(`should return the current active threshold for ${CURRENCY.GBP} payment matching tolerance`, async () => {
      // Arrange
      const gbpToleranceEntity = PaymentMatchingToleranceEntityMockBuilder.forCurrency(CURRENCY.GBP).withIsActive(true).withThreshold(1.23).build();
      jest.spyOn(PaymentMatchingToleranceRepo, 'findOneByCurrencyAndIsActiveTrue').mockResolvedValue(gbpToleranceEntity);

      // Act
      const tolerance = await PaymentMatchingToleranceService.getGbpPaymentMatchingTolerance();

      // Assert
      expect(tolerance).toEqual(1.23);
    });
  });
});
