import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FeeRecordEntity } from '../fee-record/fee-record.entity';
import { RequestedByUserPartialEntity } from '../partial-entities';
import { AuditableBaseEntity } from '../base-entities';
import { CreateFeeRecordCorrectionParams } from './fee-record-correction.types';
import { RecordCorrectionReason } from '../../types';

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
   * The reasons for the correction, comma separated
   */
  @Column({ type: 'nvarchar', length: '500' })
  private reasonsStringified!: string;

  /**
   * Additional information about the reasons for the correction
   */
  @Column({ type: 'nvarchar', length: '500' })
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

  /**
   * The reasons for the record correction
   */
  get reasons(): RecordCorrectionReason[] {
    return this.reasonsStringified.split(',') as RecordCorrectionReason[];
  }

  /**
   * The reasons for the record correction
   */
  set reasons(reasons: RecordCorrectionReason[]) {
    this.reasonsStringified = reasons.join(',');
  }

  /**
   * Creates a newly requested correction
   * @param param - The details of correction
   * @param param.feeRecord - The fee record the correction is for
   * @param param.requestedByUser - The user who requested the correction
   * @param param.reasons - The reasons for the correction
   * @param param.additionalInfo - The user provided additional information
   * @param param.requestSource - The request source
   * @returns The fee record correction
   */
  static createRequestedCorrection({
    feeRecord,
    requestedByUser,
    reasons,
    additionalInfo,
    requestSource,
  }: CreateFeeRecordCorrectionParams): FeeRecordCorrectionEntity {
    const recordCorrection = new FeeRecordCorrectionEntity();
    recordCorrection.feeRecord = feeRecord;
    recordCorrection.reasons = reasons;
    recordCorrection.requestedByUser = requestedByUser;
    recordCorrection.additionalInfo = additionalInfo;
    recordCorrection.isCompleted = false;
    recordCorrection.updateLastUpdatedBy(requestSource);
    return recordCorrection;
  }
}
