import { DbRequestSource, FeeRecordEntity, FeeRecordCorrectionEntity } from '../../sql-db-entities';
import { RECORD_CORRECTION_REASON, REQUEST_PLATFORM_TYPE } from '../../constants';
import { FeeRecordEntityMockBuilder } from './fee-record.entity.mock-builder';
import { RecordCorrectionReason, RecordCorrectionValues, RequestedByUser } from '../../types';

export class FeeRecordCorrectionEntityMockBuilder {
  private readonly correction: FeeRecordCorrectionEntity;

  private constructor(correction: FeeRecordCorrectionEntity) {
    this.correction = correction;
  }

  public static forIsCompleted(isCompleted: boolean): FeeRecordCorrectionEntityMockBuilder {
    return FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(new FeeRecordEntityMockBuilder().build(), isCompleted);
  }

  public static forFeeRecordAndIsCompleted(feeRecord: FeeRecordEntity, isCompleted: boolean): FeeRecordCorrectionEntityMockBuilder {
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

    if (isCompleted) {
      data.isCompleted = true;
      data.dateReceived = new Date();
      data.bankCommentary = 'some commentary';

      data.previousValues = {
        facilityUtilisation: 600000,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: null,
      };

      data.correctedValues = {
        facilityUtilisation: 500000,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: null,
      };
    } else {
      data.isCompleted = false;
      data.dateReceived = null;
      data.bankCommentary = null;

      data.previousValues = {
        facilityUtilisation: null,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: null,
      };

      data.correctedValues = {
        facilityUtilisation: null,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: null,
      };
    }

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

  public withDateReceived(dateReceived: Date | null): FeeRecordCorrectionEntityMockBuilder {
    this.correction.dateReceived = dateReceived;
    return this;
  }

  public withBankCommentary(bankCommentary: string | null): FeeRecordCorrectionEntityMockBuilder {
    this.correction.bankCommentary = bankCommentary;
    return this;
  }

  public withPreviousValues(previousValues: Partial<RecordCorrectionValues>): FeeRecordCorrectionEntityMockBuilder {
    this.correction.previousValues = {
      facilityUtilisation: previousValues.facilityUtilisation ?? null,
      feesPaidToUkefForThePeriod: previousValues.feesPaidToUkefForThePeriod ?? null,
      feesPaidToUkefForThePeriodCurrency: previousValues.feesPaidToUkefForThePeriodCurrency ?? null,
      facilityId: previousValues.facilityId ?? null,
    };
    return this;
  }

  public withCorrectedValues(correctedValues: Partial<RecordCorrectionValues>): FeeRecordCorrectionEntityMockBuilder {
    this.correction.correctedValues = {
      facilityUtilisation: correctedValues.facilityUtilisation ?? null,
      feesPaidToUkefForThePeriod: correctedValues.feesPaidToUkefForThePeriod ?? null,
      feesPaidToUkefForThePeriodCurrency: correctedValues.feesPaidToUkefForThePeriodCurrency ?? null,
      facilityId: correctedValues.facilityId ?? null,
    };
    return this;
  }

  public build(): FeeRecordCorrectionEntity {
    return this.correction;
  }
}
