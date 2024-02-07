import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportEntity } from './utilisation-report';
import { AuditableEntity } from './base-entities';

@Entity('AzureFileInfo')
export class AzureFileInfoEntity extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The folder that the file is contained within in Azure Storage
   * @example '123'
   */
  @Column()
  folder!: string;

  /**
   * The filename
   * @example '2023_12_Bank_utilisation_report.csv'
   */
  @Column()
  filename!: string;

  /**
   * The full path of the file in Azure Storage (i.e. the folder and filename)
   * @example '123/2023_12_Bank_utilisation_report.csv'
   */
  @Column()
  fullPath!: string;

  /**
   * The URL used to directly access the file in Azure Storage
   * @example 'https://my-storage.file.core.windows.net/file-share-name/123/2023_12_Bank_utilisation_report.csv'
   */
  @Column()
  url!: string;

  /**
   * MIME type - indicating the nature and format of the document
   * @example 'text/csv'
   */
  @Column()
  mimetype!: string;

  /**
   * The associated utilisation report
   */
  @OneToOne(() => UtilisationReportEntity, (report) => report.azureFileInfo, {
    nullable: false,
  })
  @JoinColumn()
  utilisationReport!: UtilisationReportEntity;
}
