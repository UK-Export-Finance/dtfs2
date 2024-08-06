import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { AuditableBaseEntity } from '../base-entities';
import { FeeRecordEntity } from '../fee-record';
import { MonetaryColumn } from '../custom-columns';
import { ReportPeriodPartialEntity } from '../partial-entities';
import { CreateFacilityUtilisationDataWithoutUtilisationParams } from './facility-utilisation-data.types';

@Entity('FacilityUtilisationData')
export class FacilityUtilisationDataEntity extends AuditableBaseEntity {
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

  public static createWithoutUtilisation({
    id,
    reportPeriod,
    requestSource,
  }: CreateFacilityUtilisationDataWithoutUtilisationParams): FacilityUtilisationDataEntity {
    const data = new FacilityUtilisationDataEntity();
    data.id = id;
    data.reportPeriod = reportPeriod;
    data.updateLastUpdatedBy(requestSource);
    return data;
  }
}
