import { RECORD_CORRECTION_REASON } from '../../constants';
import { FeeRecordCorrectionTransientFormDataEntity } from '../../sql-db-entities';
import { RecordCorrectionTransientFormData } from '../../types';

export class FeeRecordCorrectionTransientFormDataEntityMockBuilder {
  private readonly transientFormData: FeeRecordCorrectionTransientFormDataEntity;

  public constructor() {
    const data = new FeeRecordCorrectionTransientFormDataEntity();

    data.userId = 'abc123';
    data.feeRecordId = 123;
    data.formData = {
      reasons: [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT],
      additionalInfo: 'some more information',
    };

    this.transientFormData = data;
  }

  public withUserId(userId: string): FeeRecordCorrectionTransientFormDataEntityMockBuilder {
    this.transientFormData.userId = userId;
    return this;
  }

  public withFeeRecordId(feeRecordId: number): FeeRecordCorrectionTransientFormDataEntityMockBuilder {
    this.transientFormData.feeRecordId = feeRecordId;
    return this;
  }

  public withFormData(formData: RecordCorrectionTransientFormData): FeeRecordCorrectionTransientFormDataEntityMockBuilder {
    this.transientFormData.formData = formData;
    return this;
  }

  public build(): FeeRecordCorrectionTransientFormDataEntity {
    return this.transientFormData;
  }
}
