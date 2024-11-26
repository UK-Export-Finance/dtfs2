import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FeeRecordEntity } from '../fee-record/fee-record.entity';
import { RequestedByUserPartialEntity } from '../partial-entities';
import { AuditableBaseEntity } from '../base-entities';
import { CreateFeeRecordCorrectionParams } from './fee-record-correction.types';

@Entity('FeeRecordCorrection')
export class FeeRecordCorrectionEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The linked fee record
   */
  @ManyToOne(() => FeeRecordEntity, (feeRecord) => feeRecord.corrections, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  feeRecord!: FeeRecordEntity;

  /**
   * The details of the user that requested the correction
   */
  @Column(() => RequestedByUserPartialEntity)
  requestedByUser!: RequestedByUserPartialEntity;

  /**
   * The reasons for the correction
   */
  @Column({ type: 'simple-array' })
  reasons!: string[];

  /**
   * Additional information about the reasons for the correction
   */
  @Column({ type: 'ntext' })
  additionalInfo!: string;

  /**
   * The date the correction was requested
   */
  @CreateDateColumn()
  dateRequested!: Date;

  /**
   * Whether the record correction has been completed
   */
  @Column()
  isCompleted!: boolean;

  static createRequestedCorrection({ feeRecord, requestedByUser, reasons, additionalInfo }: CreateFeeRecordCorrectionParams): FeeRecordCorrectionEntity {
    const recordCorrection = new FeeRecordCorrectionEntity();
    recordCorrection.feeRecord = feeRecord;
    recordCorrection.reasons = reasons;
    recordCorrection.requestedByUser = requestedByUser;
    recordCorrection.additionalInfo = additionalInfo;
    return recordCorrection;
  }
}
