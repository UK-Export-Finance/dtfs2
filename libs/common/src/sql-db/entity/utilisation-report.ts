import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportReconciliationStatus } from '../../types';
import { ReportPeriod } from './partials';

@Entity('UtilisationReport')
export class UtilisationReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  bankId!: string;

  @Column(() => ReportPeriod)
  reportPeriod!: ReportPeriod;

  // TODO FN-1859 - add AzureFileInfoEntity
  // @OneToOne(() => AzureFileInfoEntity)
  // @JoinColumn()
  // readonly azureFileInfo: AzureFileInfoEntity

  @Column()
  status!: UtilisationReportReconciliationStatus;

  @Column({ type: 'datetime', nullable: true })
  dateUploaded!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  uploadedByUserId!: string | null;
}
