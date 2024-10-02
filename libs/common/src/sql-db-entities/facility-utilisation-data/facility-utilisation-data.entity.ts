import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { AuditableBaseEntity } from '../base-entities';
import { FeeRecordEntity } from '../fee-record';
import { MonetaryColumn } from '../custom-columns';
import { ReportPeriodPartialEntity } from '../partial-entities';
import { CreateFacilityUtilisationDataParams, UpdateWithCurrentReportPeriodDetailsParams } from './facility-utilisation-data.types';

/**
 * Entity representing facility utilisation data
 */
@Entity('FacilityUtilisationData')
export class FacilityUtilisationDataEntity extends AuditableBaseEntity {
  /**
   * Primary key for the entity
   */
  @PrimaryColumn({ type: 'nvarchar', length: '10' })
  id!: string;

  /**
   * Details the start and end of the report period
   */
  @Column(() => ReportPeriodPartialEntity)
  reportPeriod!: ReportPeriodPartialEntity;

  /**
   * The fee records linked to the facility
   */
  @OneToMany(() => FeeRecordEntity, (feeRecord) => feeRecord.facilityUtilisationData, {
    nullable: false,
    eager: false,
  })
  feeRecords!: FeeRecordEntity[];

  /**
   * The facility utilisation
   */
  @MonetaryColumn({ defaultValue: 0 })
  utilisation!: number;

  /**
   * The facility fixed fee
   */
  @MonetaryColumn({ defaultValue: 0 })
  fixedFee!: number;

  /**
   * Creates a new FacilityUtilisationDataEntity
   * @param facilityUtilisationData - Parameters for creating the entity
   * @param facilityUtilisationData.id - The ID of the entity
   * @param facilityUtilisationData.reportPeriod - The report period details
   * @param facilityUtilisationData.utilisation - The facility utilisation
   * @param facilityUtilisationData.fixedFee - The facility fixed fee
   * @param facilityUtilisationData.requestSource - The source of the request
   * @returns The created entity
   */
  public static create({ id, reportPeriod, utilisation, fixedFee, requestSource }: CreateFacilityUtilisationDataParams): FacilityUtilisationDataEntity {
    const data = new FacilityUtilisationDataEntity();
    data.id = id;
    data.reportPeriod = reportPeriod;
    data.utilisation = utilisation;
    data.fixedFee = fixedFee;
    data.updateLastUpdatedBy(requestSource);
    return data;
  }

  /**
   * Creates a new FacilityUtilisationDataEntity with utilisation and fixed fee
   * @param facilityUtilisationData - Parameters for creating the entity
   * @param facilityUtilisationData.id - The ID of the entity
   * @param facilityUtilisationData.reportPeriod - The report period details
   * @param facilityUtilisationData.requestSource - The source of the request
   * @param facilityUtilisationData.utilisation - The utilisation value
   * @param facilityUtilisationData.fixedFee - The fixed fee value
   * @returns The created entity
   */
  public static createWithUtilisationAndFixedFee({
    id,
    reportPeriod,
    requestSource,
    utilisation,
    fixedFee,
  }: CreateFacilityUtilisationDataParams): FacilityUtilisationDataEntity {
    const data = new FacilityUtilisationDataEntity();
    data.id = id;
    data.reportPeriod = reportPeriod;
    data.updateLastUpdatedBy(requestSource);
    data.utilisation = utilisation;
    data.fixedFee = fixedFee;
    return data;
  }

  /**
   * Updates the entity with current report period details
   * @param facilityUtilisationData - Parameters for updating the entity
   * @param facilityUtilisationData.fixedFee - The updated fixed fee
   * @param facilityUtilisationData.utilisation - The updated utilisation
   * @param facilityUtilisationData.reportPeriod - The updated report period details
   * @param facilityUtilisationData.requestSource - The source of the update request
   */
  public updateWithCurrentReportPeriodDetails({ fixedFee, utilisation, reportPeriod, requestSource }: UpdateWithCurrentReportPeriodDetailsParams): void {
    this.fixedFee = fixedFee;
    this.utilisation = utilisation;
    this.reportPeriod = reportPeriod;
    this.updateLastUpdatedBy(requestSource);
  }
}
