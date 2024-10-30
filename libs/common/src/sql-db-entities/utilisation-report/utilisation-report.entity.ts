import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportReconciliationStatus } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { ReportPeriodPartialEntity } from '../partial-entities';
import { AzureFileInfoEntity } from '../azure-file-info';
import { FeeRecordEntity } from '../fee-record';
import {
  CreateNotReceivedUtilisationReportEntityParams,
  UpdateWithStatusParams,
  UpdateWithUploadDetailsParams,
  UpdateWithFeeRecordsParams,
} from './utilisation-report.types';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';

@Entity('UtilisationReport')
export class UtilisationReportEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The `id` (not `_id`) of the associated bank (from the 'banks' MongoDB collection)
   */
  @Column()
  bankId!: string;

  /**
   * Details the start and end of the report period.
   */
  @Column(() => ReportPeriodPartialEntity)
  reportPeriod!: ReportPeriodPartialEntity;

  /**
   * The date and time that the report was originally uploaded
   */
  @Column({ type: 'datetime2', nullable: true })
  dateUploaded!: Date | null;

  /**
   * Metadata about the file uploaded to Azure Storage
   */
  @OneToOne(() => AzureFileInfoEntity, (fileInfo) => fileInfo.utilisationReport, {
    eager: true,
    cascade: ['insert', 'update'],
  })
  azureFileInfo?: AzureFileInfoEntity;

  /**
   * Status code representing reconciliation progress of the report
   */
  @Column({ type: 'nvarchar' })
  status!: UtilisationReportReconciliationStatus;

  /**
   * The `_id` of the user (from the 'users' MongoDB collection) that uploaded the report
   */
  @Column({ type: 'nvarchar', nullable: true })
  uploadedByUserId!: string | null;

  /**
   * Breakdown of utilisation per facility and currency combination
   */
  @OneToMany(() => FeeRecordEntity, (feeRecord) => feeRecord.report, {
    cascade: ['insert', 'update'],
  })
  feeRecords!: FeeRecordEntity[];

  /**
   * Creates a utilisation report entity with status REPORT_NOT_RECEIVED
   * @param param - The parameters to create the entity with
   * @param param.bankId - The bank id
   * @param param.reportPeriod - The report period
   * @param param.requestSource - The request source
   * @returns The created entity
   */
  static createNotReceived({ bankId, reportPeriod, requestSource }: CreateNotReceivedUtilisationReportEntityParams): UtilisationReportEntity {
    const report = new UtilisationReportEntity();
    report.bankId = bankId;
    report.reportPeriod = reportPeriod;
    report.dateUploaded = null;
    report.status = UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED;
    report.uploadedByUserId = null;
    report.updateLastUpdatedBy(requestSource);
    return report;
  }

  /**
   * Updates the report with the upload details
   * @param param - The parameters to update the report with
   * @param param.azureFileInfo - The azure file info
   * @param param.uploadedByUserId - The id of the user who uploaded the report
   * @param param.requestSource - The request source
   */
  public updateWithUploadDetails({ azureFileInfo, uploadedByUserId, requestSource }: UpdateWithUploadDetailsParams): void {
    this.dateUploaded = new Date();
    this.azureFileInfo = azureFileInfo;
    this.status = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
    this.uploadedByUserId = uploadedByUserId;
    this.updateLastUpdatedBy(requestSource);
  }

  /**
   * Updates the report with fee records
   * @param param - The parameters to update the report with
   * @param param.feeRecords - The fee records
   */
  public updateWithFeeRecords({ feeRecords }: UpdateWithFeeRecordsParams): void {
    this.feeRecords = feeRecords;
  }

  /**
   * Updates the report with a supplied status
   * @param param - The parameters to update the report with
   * @param param.status - The status
   * @param param.requestSource - The request source
   */
  public updateWithStatus({ status, requestSource }: UpdateWithStatusParams): void {
    this.status = status;
    this.updateLastUpdatedBy(requestSource);
  }
}
