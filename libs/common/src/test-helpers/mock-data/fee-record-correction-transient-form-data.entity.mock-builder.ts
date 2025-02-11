import { FeeRecordCorrectionTransientFormDataEntity } from '../../sql-db-entities';
import { RecordCorrectionTransientFormData } from '../../types';
import { anEmptyRecordCorrectionTransientFormData } from '../record-correction-transient-form-data';

export class FeeRecordCorrectionTransientFormDataEntityMockBuilder {
  private readonly transientFormData: FeeRecordCorrectionTransientFormDataEntity;

  public constructor() {
    const data = new FeeRecordCorrectionTransientFormDataEntity();

    data.userId = 'abc123';
    data.correctionId = 123;
    data.formData = {
      ...anEmptyRecordCorrectionTransientFormData(),
      utilisation: 10000,
    };

    this.transientFormData = data;
  }

  public withUserId(userId: string): FeeRecordCorrectionTransientFormDataEntityMockBuilder {
    this.transientFormData.userId = userId;
    return this;
  }

  public withCorrectionId(correctionId: number): FeeRecordCorrectionTransientFormDataEntityMockBuilder {
    this.transientFormData.correctionId = correctionId;
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
