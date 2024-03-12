import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportReconciliationStatus } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { ReportPeriodPartialEntity } from '../partial-entities';
import { AzureFileInfoEntity } from '../azure-file-info';
import { FeeRecordEntity } from '../fee-record';
import { CreateNotReceivedUtilisationReportEntityParams, UpdateWithUploadDetailsParams } from './utilisation-report.types';
import { DbRequestSource, getDbAuditUpdatedByUserId } from '../helpers';

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
  @Column({ type: 'datetime', nullable: true })
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
  @Column({ type: 'varchar' })
  status!: UtilisationReportReconciliationStatus;

  /**
   * The `_id` of the user (from the 'users' MongoDB collection) that uploaded the report
   */
  @Column({ type: 'varchar', nullable: true })
  uploadedByUserId!: string | null;

  /**
   * Breakdown of utilisation per facility and currency combination
   * TODO FN-2183 - should this maybe be called `payments`, `feeRecords`, or something else?
   */
  @OneToMany(() => FeeRecordEntity, (feeRecord) => feeRecord.report, {
    cascade: ['insert', 'update'],
  })
  feeRecords!: FeeRecordEntity[];

  static createNotReceived({ bankId, reportPeriod, requestSource }: CreateNotReceivedUtilisationReportEntityParams): UtilisationReportEntity {
    const report = new UtilisationReportEntity();
    report.bankId = bankId;
    report.reportPeriod = reportPeriod;
    report.dateUploaded = null;
    report.status = 'REPORT_NOT_RECEIVED';
    report.uploadedByUserId = null;
    report.updatedByUserId = getDbAuditUpdatedByUserId(requestSource);
    return report;
  }

  public updateWithUploadDetails({ azureFileInfo, feeRecords, uploadedByUserId, requestSource }: UpdateWithUploadDetailsParams): void {
    this.dateUploaded = new Date();
    this.azureFileInfo = azureFileInfo;
    this.status = 'PENDING_RECONCILIATION';
    this.uploadedByUserId = uploadedByUserId;
    this.feeRecords = feeRecords;
    this.updatedByUserId = getDbAuditUpdatedByUserId(requestSource);
  }

  public setAsCompleted({ requestSource }: { requestSource: DbRequestSource }): void {
    this.status = 'RECONCILIATION_COMPLETED';
    this.updatedByUserId = getDbAuditUpdatedByUserId(requestSource);
  }

  public setAsNotCompleted({ requestSource }: { requestSource: DbRequestSource }): void {
    this.status = this.azureFileInfo ? 'PENDING_RECONCILIATION' : 'REPORT_NOT_RECEIVED';
    this.updatedByUserId = getDbAuditUpdatedByUserId(requestSource);
  }
}
