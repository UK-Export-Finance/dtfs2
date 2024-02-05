import { Column, DeepPartial, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UtilisationReportEntity } from './utilisation-report';

@Entity('AzureFileInfo')
export class AzureFileInfoEntity {
  @OneToOne(() => UtilisationReportEntity, (report) => report.azureFileInfo)
  @JoinColumn()
  utilisationReport!: UtilisationReportEntity;

  @Column()
  folder!: string;

  @Column()
  filename!: string;

  @Column()
  fullPath!: string;

  @Column()
  url!: string;

  @Column()
  mimetype!: string;

  constructor(params?: DeepPartial<AzureFileInfoEntity>) {
    Object.assign(this, params);
  }

  static create(params: AzureFileInfoEntity): AzureFileInfoEntity {
    return new AzureFileInfoEntity(params);
  }
}
