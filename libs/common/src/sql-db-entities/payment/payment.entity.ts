import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { UpdateWithAdditionalFeeRecordsParams, CreatePaymentParams, UpdatePaymentParams } from './payment.types';
import { FeeRecordEntity } from '../fee-record';
import { MonetaryColumn } from '../custom-columns';

@Entity('Payment')
export class PaymentEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The currency the payment was made in
   */
  @Column({ nullable: false, type: 'nvarchar' })
  currency!: Currency;

  /**
   * The amount received in the payment
   */
  @MonetaryColumn({ nullable: false })
  amount!: number;

  /**
   * The date the payment was received
   */
  @Column({ nullable: false })
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

  /**
   * Creates an instance of the entity
   * @param param - The parameters to create the entity with
   * @returns The created entity
   */
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

  /**
   * Updates the payment entity
   * @param param - The parameters to update the payment with
   */
  public update({ amount, dateReceived, reference, requestSource }: UpdatePaymentParams): void {
    this.amount = amount;
    this.dateReceived = dateReceived;
    this.reference = reference;
    this.updateLastUpdatedBy(requestSource);
  }

  /**
   * Updates the payment with additional fee records
   * @param param - The parameters to update the payment with
   */
  public updateWithAdditionalFeeRecords({ additionalFeeRecords, requestSource }: UpdateWithAdditionalFeeRecordsParams): void {
    const existingIds = new Set(this.feeRecords.map((record) => record.id));
    const duplicateIds = additionalFeeRecords.filter((record) => existingIds.has(record.id));
    if (duplicateIds.length > 0) {
      throw new Error(`Fee record(s) with id(s) ${duplicateIds.map((record) => record.id).join(', ')} are already attached to this payment.`);
    }

    this.feeRecords = [...this.feeRecords, ...additionalFeeRecords];
    this.updateLastUpdatedBy(requestSource);
  }
}
