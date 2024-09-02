import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportEntity } from '../utilisation-report';
import { AuditableBaseEntity } from '../base-entities';
import { CreateAzureFileInfoParams } from './azure-file-info.types';

@Entity('AzureFileInfo')
export class AzureFileInfoEntity extends AuditableBaseEntity {
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
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  utilisationReport!: UtilisationReportEntity;

  /**
   * Creates an instance of the azure file info entity
   * @param param - The parameters to create the entity with
   * @param param.folder - The folder
   * @param param.filename - The filename
   * @param param.fullPath - The full path
   * @param param.url - The URL
   * @param param.mimetype - The mimetype
   * @param param.requestSource - The request source
   * @returns The created entity
   */
  static create({ folder, filename, fullPath, url, mimetype, requestSource }: CreateAzureFileInfoParams): AzureFileInfoEntity {
    const azureFileInfo = new AzureFileInfoEntity();
    azureFileInfo.folder = folder;
    azureFileInfo.filename = filename;
    azureFileInfo.fullPath = fullPath;
    azureFileInfo.url = url;
    azureFileInfo.mimetype = mimetype;
    azureFileInfo.updateLastUpdatedBy(requestSource);
    return azureFileInfo;
  }
}
