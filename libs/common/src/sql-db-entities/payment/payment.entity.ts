import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../types';
import { TableWithLedgerEnabled } from '../base-entities';
import { CreatePaymentParams } from './payment.types';
import { FeeRecordEntity } from '../fee-record';
import { MonetaryColumn } from '../custom-columns';

@Entity('Payment')
export class PaymentEntity extends TableWithLedgerEnabled {
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
  @MonetaryColumn({ nullable: true })
  amount!: number;

  /**
   * The date the payment was received
   */
  @Column()
  dateReceived!: Date;

  /**
   * The payment reference (optional)
   */
  @Column({ nullable: true, type: 'nvarchar' })
  reference?: string;

  /**
   * The fee records attached to the payment
   */
  @ManyToMany(() => FeeRecordEntity, (feeRecord) => feeRecord.payments, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
  })
  feeRecords!: FeeRecordEntity[];

  static create({ currency, amount, dateReceived, reference, feeRecords, requestSource }: CreatePaymentParams): PaymentEntity {
    const payment = new PaymentEntity();
    payment.currency = currency;
    payment.amount = amount;
    payment.dateReceived = dateReceived;
    payment.reference = reference;
    payment.feeRecords = feeRecords;
    payment.updateLastUpdatedBy(requestSource);
    return payment;
  }
}
