import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportReconciliationStatus } from '../types';
import { AuditableEntity, ReportPeriodPartial } from './partials';
import { AzureFileInfoEntity } from './azure-file-info';
import { UtilisationDataEntity } from './utilisation-data';

@Entity('UtilisationReport')
export class UtilisationReportEntity extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The `id` (not `_id`) of the associated bank (from the 'banks' MongoDB collection)
   */
  @Column()
  bankId!: string;

  /**
   * Details the start and end of the report period.
   * @example { start: { month: 1, year: 2023 }, end: { month: 1, year: 2023 } }
   */
  @Column(() => ReportPeriodPartial)
  reportPeriod!: ReportPeriodPartial;

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
}
