import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { CreatePaymentParams } from './payment.types';
import { FeeRecordEntity } from '../fee-record';

@Entity('Payment')
export class PaymentEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The currency the payment was made in
   */
  @Column({ type: 'nvarchar' })
  currency!: Currency;

  /**
   * The amount received in the payment
   */
  @Column()
  amountReceived!: number;

  /**
   * The date the payment was received
   */
  @Column()
  dateReceived!: Date;

  /**
   * The payment reference (optional)
   */
  @Column({ nullable: true, type: 'nvarchar' })
  paymentReference?: string;

  /**
   * The fee records attached to the payment
   */
  @ManyToMany(() => FeeRecordEntity, (feeRecord) => feeRecord.payments, {
    cascade: ['insert'],
  })
  feeRecords!: FeeRecordEntity[];

  static create({ currency, amountReceived, dateReceived, paymentReference, feeRecords, requestSource }: CreatePaymentParams): PaymentEntity {
    const payment = new PaymentEntity();
    payment.currency = currency;
    payment.amountReceived = amountReceived;
    payment.dateReceived = dateReceived;
    payment.paymentReference = paymentReference;
    payment.feeRecords = feeRecords;
    payment.updateLastUpdatedBy(requestSource);
    return payment;
  }
}
