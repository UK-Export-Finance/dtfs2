import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportReconciliationStatus } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { ReportPeriodPartialEntity } from '../partial-entities';
import { AzureFileInfoEntity } from '../azure-file-info';
import { UtilisationDataEntity } from '../utilisation-data';
import { CreateNotReceivedUtilisationReportEntityParams } from './utilisation-report.types';
import { getDbAuditUpdatedByUserId } from '../helpers';

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
  @Column()
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
  @OneToMany(() => UtilisationDataEntity, (data) => data.report, {
    cascade: ['insert', 'update'],
  })
  data!: UtilisationDataEntity[];

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
}
