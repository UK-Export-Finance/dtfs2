import { REQUEST_PLATFORM_TYPE } from '../../constants';
import { FeeRecordEntity, FacilityUtilisationDataEntity } from '../../sql-db-entities';
import { ReportPeriod } from '../../types';

export class FacilityUtilisationDataEntityMockBuilder {
  private readonly data: FacilityUtilisationDataEntity;

  private constructor(facility: FacilityUtilisationDataEntity) {
    this.data = facility;
  }

  public static forId(id: string): FacilityUtilisationDataEntityMockBuilder {
    const facility = new FacilityUtilisationDataEntity();
    facility.id = id;
    facility.utilisation = 0;
    facility.reportPeriod = {
      start: { month: 1, year: 2024 },
      end: { month: 1, year: 2024 },
    };
    facility.fixedFee = 0;
    facility.updateLastUpdatedBy({ platform: REQUEST_PLATFORM_TYPE.SYSTEM });
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

  public withReportPeriod(reportPeriod: ReportPeriod): FacilityUtilisationDataEntityMockBuilder {
    this.data.reportPeriod = reportPeriod;
    return this;
  }

  public withFixedFee(fixedFee: number): FacilityUtilisationDataEntityMockBuilder {
    this.data.fixedFee = fixedFee;
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
