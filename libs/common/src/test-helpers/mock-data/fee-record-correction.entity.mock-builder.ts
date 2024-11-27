import { DbRequestSource, FeeRecordEntity, FeeRecordCorrectionEntity } from '../../sql-db-entities';
import { RECORD_CORRECTION_REASON, REQUEST_PLATFORM_TYPE } from '../../constants';
import { FeeRecordEntityMockBuilder } from './fee-record.entity.mock-builder';
import { RecordCorrectionReason, RequestedByUser } from '../../types';

export class FeeRecordCorrectionEntityMockBuilder {
  private readonly correction: FeeRecordCorrectionEntity;

  public constructor(correction?: FeeRecordCorrectionEntity) {
    this.correction = correction ?? FeeRecordCorrectionEntityMockBuilder.forFeeRecord(new FeeRecordEntityMockBuilder().build()).correction;
  }

  public static forFeeRecord(feeRecord: FeeRecordEntity): FeeRecordCorrectionEntityMockBuilder {
    const data = new FeeRecordCorrectionEntity();
    const userId = '5ce819935e539c343f141ece';
    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.PORTAL,
      userId,
    };

    data.id = 1;
    data.feeRecord = feeRecord;
    data.requestedByUser = {
      id: userId,
      firstName: 'first',
      lastName: 'last',
    };
    data.additionalInfo = 'some info';
    data.reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];
    data.isCompleted = false;
    data.updateLastUpdatedBy(requestSource);
    return new FeeRecordCorrectionEntityMockBuilder(data);
  }

  public withId(id: number): FeeRecordCorrectionEntityMockBuilder {
    this.correction.id = id;
    return this;
  }

  public withReasons(reasons: RecordCorrectionReason[]): FeeRecordCorrectionEntityMockBuilder {
    this.correction.reasons = reasons;
    return this;
  }

  public withAdditionalInfo(info: string): FeeRecordCorrectionEntityMockBuilder {
    this.correction.additionalInfo = info;
    return this;
  }

  public withRequestedByUser(requestedByUser: RequestedByUser): FeeRecordCorrectionEntityMockBuilder {
    this.correction.requestedByUser = requestedByUser;
    return this;
  }

  public withDateRequested(dateRequested: Date): FeeRecordCorrectionEntityMockBuilder {
    this.correction.dateRequested = dateRequested;
    return this;
  }

  public withIsCompleted(isCompleted: boolean): FeeRecordCorrectionEntityMockBuilder {
    this.correction.isCompleted = isCompleted;
    return this;
  }

  public withLastUpdatedByIsSystemUser(isSystemUser: boolean): FeeRecordCorrectionEntityMockBuilder {
    this.correction.lastUpdatedByIsSystemUser = isSystemUser;
    return this;
  }

  public withLastUpdatedByPortalUserId(userId: string | null): FeeRecordCorrectionEntityMockBuilder {
    this.correction.lastUpdatedByPortalUserId = userId;
    return this;
  }

  public withLastUpdatedByTfmUserId(userId: string | null): FeeRecordCorrectionEntityMockBuilder {
    this.correction.lastUpdatedByTfmUserId = userId;
    return this;
  }

  public build(): FeeRecordCorrectionEntity {
    return this.correction;
  }
}
