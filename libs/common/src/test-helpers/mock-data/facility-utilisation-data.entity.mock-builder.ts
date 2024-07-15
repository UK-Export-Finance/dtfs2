import { FeeRecordEntity, FacilityUtilisationDataEntity } from '../../sql-db-entities';

export class FacilityUtilisationDataEntityMockBuilder {
  private readonly data: FacilityUtilisationDataEntity;

  private constructor(facility: FacilityUtilisationDataEntity) {
    this.data = facility;
  }

  public static forId(id: string): FacilityUtilisationDataEntityMockBuilder {
    const facility = new FacilityUtilisationDataEntity();
    facility.id = id;
    facility.utilisation = 0;
    facility.updateLastUpdatedBy({ platform: 'SYSTEM' });
    return new FacilityUtilisationDataEntityMockBuilder(facility);
  }

  public withUtilisation(utilisation: number): FacilityUtilisationDataEntityMockBuilder {
    this.data.utilisation = utilisation;
    return this;
  }

  public withFeeRecords(feeRecords: FeeRecordEntity[]): FacilityUtilisationDataEntityMockBuilder {
    this.data.feeRecords = feeRecords;
    return this;
  }

  public withLastUpdatedByIsSystemUser(isSystemUser: boolean): FacilityUtilisationDataEntityMockBuilder {
    this.data.lastUpdatedByIsSystemUser = isSystemUser;
    return this;
  }

  public withLastUpdatedByPortalUserId(userId: string | null): FacilityUtilisationDataEntityMockBuilder {
    this.data.lastUpdatedByPortalUserId = userId;
    return this;
  }

  public withLastUpdatedByTfmUserId(userId: string | null): FacilityUtilisationDataEntityMockBuilder {
    this.data.lastUpdatedByTfmUserId = userId;
    return this;
  }

  public build(): FacilityUtilisationDataEntity {
    return this.data;
  }
}
