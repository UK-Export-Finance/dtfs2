import { RECORD_CORRECTION_REASON } from '../../constants';
import { FeeRecordCorrectionRequestTransientFormDataEntity } from '../../sql-db-entities';
import { RecordCorrectionRequestTransientFormData } from '../../types';

export class FeeRecordCorrectionRequestTransientFormDataEntityMockBuilder {
  private readonly transientFormData: FeeRecordCorrectionRequestTransientFormDataEntity;

  public constructor() {
    const data = new FeeRecordCorrectionRequestTransientFormDataEntity();

    data.userId = 'abc123';
    data.feeRecordId = 123;
    data.formData = {
      reasons: [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT],
      additionalInfo: 'some more information',
    };

    this.transientFormData = data;
  }

  public withUserId(userId: string): FeeRecordCorrectionRequestTransientFormDataEntityMockBuilder {
    this.transientFormData.userId = userId;
    return this;
  }

  public withFeeRecordId(feeRecordId: number): FeeRecordCorrectionRequestTransientFormDataEntityMockBuilder {
    this.transientFormData.feeRecordId = feeRecordId;
    return this;
  }

  public withFormData(formData: RecordCorrectionRequestTransientFormData): FeeRecordCorrectionRequestTransientFormDataEntityMockBuilder {
    this.transientFormData.formData = formData;
    return this;
  }

  public build(): FeeRecordCorrectionRequestTransientFormDataEntity {
    return this.transientFormData;
  }
}
