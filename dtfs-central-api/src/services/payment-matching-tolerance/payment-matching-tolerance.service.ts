import { CURRENCY } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../errors';
import { PaymentMatchingToleranceRepo } from '../../repositories/payment-matching-tolerance-repo';

export class PaymentMatchingToleranceService {
  public static async getGbpPaymentMatchingTolerance() {
    const toleranceEntity = await PaymentMatchingToleranceRepo.findOneByCurrencyAndIsActiveTrue(CURRENCY.GBP);

    if (!toleranceEntity) {
      throw new NotFoundError(`No active payment matching tolerance found for currency ${CURRENCY.GBP}`);
    }

    return toleranceEntity.threshold;
  }
}
