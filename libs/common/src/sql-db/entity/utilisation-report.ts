import { Column, DeepPartial, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportReconciliationStatus } from '../../types';
import { ReportPeriodPartial } from './partials';
import { AzureFileInfoEntity } from './azure-file-info';

@Entity('UtilisationReport')
export class UtilisationReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  bankId!: string;

  @Column(() => ReportPeriodPartial)
  reportPeriod!: ReportPeriodPartial;

  @OneToOne(() => AzureFileInfoEntity, (fileInfo) => fileInfo.utilisationReport, {
    cascade: true,
  })
  azureFileInfo?: AzureFileInfoEntity;

  @Column()
  status!: UtilisationReportReconciliationStatus;

  @Column({ type: 'datetime', nullable: true })
  dateUploaded!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  uploadedByUserId!: string | null;

  // TODO FN-1855 - ADD SOME NOTES TO THE SQL DOCS ON THIS APPROACH
  constructor(params?: DeepPartial<UtilisationReportEntity>) {
    Object.assign(this, params);
  }

  static create(params: Omit<UtilisationReportEntity, 'id' | 'azureFileInfo'>): UtilisationReportEntity {
    return new UtilisationReportEntity(params);
  }
}
