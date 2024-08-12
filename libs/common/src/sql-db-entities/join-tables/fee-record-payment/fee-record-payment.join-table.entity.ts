import { Entity, ManyToOne, JoinColumn, PrimaryColumn, Index } from 'typeorm';
import { FeeRecordEntity } from '../../fee-record';
import { PaymentEntity } from '../../payment';
import { MonetaryColumn } from '../../custom-columns';
import { CreateFeeRecordPaymentJoinTableEntityParams } from './fee-record-payment.join-table.types';

@Entity('fee_record_payments_payment')
export class FeeRecordPaymentJoinTableEntity {
  @PrimaryColumn({ nullable: false })
  @Index('IDX_7a9b7aa849fc3bb09d80fa1f81')
  feeRecordId!: number;

  @ManyToOne(() => FeeRecordEntity, (feeRecord) => feeRecord.id, {
    eager: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'feeRecordId', foreignKeyConstraintName: 'FK_7a9b7aa849fc3bb09d80fa1f812' })
  feeRecord!: FeeRecordEntity;

  @PrimaryColumn({ nullable: false })
  @Index('IDX_23bbb10be5f2136a5a5086654e')
  paymentId!: number;

  @ManyToOne(() => PaymentEntity, (payment) => payment.id, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'paymentId', foreignKeyConstraintName: 'FK_23bbb10be5f2136a5a5086654e8' })
  payment!: PaymentEntity;

  @MonetaryColumn({ nullable: true })
  paymentAmountUsedForFeeRecord!: number | null;

  public static create({
    feeRecordId,
    paymentId,
    paymentAmountUsedForFeeRecord,
  }: CreateFeeRecordPaymentJoinTableEntityParams): FeeRecordPaymentJoinTableEntity {
    const entity = new FeeRecordPaymentJoinTableEntity();
    entity.feeRecordId = feeRecordId;
    entity.paymentId = paymentId;
    entity.paymentAmountUsedForFeeRecord = paymentAmountUsedForFeeRecord;
    return entity;
  }
}
