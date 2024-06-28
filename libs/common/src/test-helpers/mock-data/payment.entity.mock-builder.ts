import { FeeRecordEntity, PaymentEntity } from '../../sql-db-entities';
import { Currency } from '../../types';

export class PaymentEntityMockBuilder {
  private readonly payment: PaymentEntity;

  private constructor(payment: PaymentEntity) {
    this.payment = payment;
  }

  public static forCurrency(currency: Currency): PaymentEntityMockBuilder {
    const payment = new PaymentEntity();
    payment.currency = currency;

    payment.id = 1;
    payment.amount = 100;
    payment.dateReceived = new Date();
    payment.reference = undefined;

    return new PaymentEntityMockBuilder(payment);
  }

  public withId(id: number): PaymentEntityMockBuilder {
    this.payment.id = id;
    return this;
  }

  public withAmount(amount: number): PaymentEntityMockBuilder {
    this.payment.amount = amount;
    return this;
  }

  public withDateReceived(dateReceived: Date): PaymentEntityMockBuilder {
    this.payment.dateReceived = dateReceived;
    return this;
  }

  public withReference(reference: string | undefined): PaymentEntityMockBuilder {
    this.payment.reference = reference;
    return this;
  }

  public withFeeRecords(feeRecords: FeeRecordEntity[]): PaymentEntityMockBuilder {
    this.payment.feeRecords = feeRecords;
    return this;
  }

  public build(): PaymentEntity {
    return this.payment;
  }
}
