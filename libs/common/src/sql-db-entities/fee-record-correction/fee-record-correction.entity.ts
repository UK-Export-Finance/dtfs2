import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FeeRecordEntity } from '../fee-record/fee-record.entity';
import { CorrectionValuesPartialEntity, RequestedByUserPartialEntity } from '../partial-entities';
import { AuditableBaseEntity } from '../base-entities';
import { CompleteCorrectionParams, CreateFeeRecordCorrectionParams } from './fee-record-correction.types';
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
   * The reasons for the correction, as a comma separated string
   */
  @Column({ type: 'nvarchar', length: '500' })
  private reasonsSerialized!: string;

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
   * The date the correction was received
   */
  @Column({ type: 'datetime2', nullable: true })
  dateReceived!: Date | null;

  /**
   * Whether the record correction has been completed
   */
  @Column()
  isCompleted!: boolean;

  /**
   * Comments about the correction provided by the bank
   */
  @Column({ type: 'nvarchar', length: '500', nullable: true })
  bankCommentary!: string | null;

  /**
   * The previous values of the fields of the fee record that the
   * correction is correcting
   */
  @Column(() => CorrectionValuesPartialEntity, { prefix: 'previous' })
  previousValues!: CorrectionValuesPartialEntity;

  /**
   * The corrected values of the fields of the fee record that the
   * correction is correcting
   */
  @Column(() => CorrectionValuesPartialEntity, { prefix: 'corrected' })
  correctedValues!: CorrectionValuesPartialEntity;

  /**
   * The reasons for the record correction
   */
  get reasons(): RecordCorrectionReason[] {
    return this.reasonsSerialized.split(',') as RecordCorrectionReason[];
  }

  /**
   * The reasons for the record correction
   */
  set reasons(reasons: RecordCorrectionReason[]) {
    this.reasonsSerialized = reasons.join(',');
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

  /**
   * Updates a correction with correct values
   * @param param - The correction parameters
   * @param param.previousValues - The previous values
   * @param param.correctedValues - The corrected values
   * @param param.bankCommentary - The bank commentary
   * @param param.requestSource - The request source
   */
  public completeCorrection({ previousValues, correctedValues, bankCommentary, requestSource }: CompleteCorrectionParams): void {
    this.correctedValues = correctedValues;
    this.previousValues = previousValues;
    this.bankCommentary = bankCommentary;

    this.dateReceived = new Date();

    this.isCompleted = true;

    this.updateLastUpdatedBy(requestSource);
  }
}
