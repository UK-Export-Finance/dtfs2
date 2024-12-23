import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AuditableBaseEntity } from '../base-entities';
import { CreateFeeRecordCorrectionRequestTransientFormDataParams } from './fee-record-correction-request-transient-form-data.types';
import { RecordCorrectionRequestTransientFormData } from '../../types';

/**
 * Entity representing correction request transient form data
 */
@Entity('FeeRecordCorrectionRequestTransientFormData')
export class FeeRecordCorrectionRequestTransientFormDataEntity extends AuditableBaseEntity {
  /**
   * The ID of the user associated with this record (Primary Key)
   */
  @PrimaryColumn({ type: 'nvarchar' })
  userId!: string;

  /**
   * The id of the linked fee record (Primary Key)
   */
  @PrimaryColumn({ nullable: false })
  feeRecordId!: number;

  /**
   * Form data stored as a serialized JSON object
   */
  @Column({ type: 'nvarchar', length: 1000 })
  private formDataSerialized!: string;

  /**
   * Gets the form data by deserializing the stored JSON string
   * @returns The deserialized form data as RecordCorrectionRequestTransientFormData
   */
  get formData(): RecordCorrectionRequestTransientFormData {
    return JSON.parse(this.formDataSerialized) as RecordCorrectionRequestTransientFormData;
  }

  /**
   * Sets the form data by serializing it to a JSON string
   * @param value - The form data to be serialized and stored
   */
  set formData(value: RecordCorrectionRequestTransientFormData) {
    this.formDataSerialized = JSON.stringify(value);
  }

  /**
   * Creates a new FeeRecordCorrectionRequestTransientFormDataEntity
   * @param feeRecordCorrectionRequestTransientFormData - Parameters for creating the entity
   * @param feeRecordCorrectionRequestTransientFormData.userId - The user ID associated with the entity
   * @param feeRecordCorrectionRequestTransientFormData.feeRecordId - The fee record ID associated with the entity
   * @param feeRecordCorrectionRequestTransientFormData.formData - The form data of the entity
   * @param feeRecordCorrectionRequestTransientFormData.requestSource - The source of the request
   * @returns The created entity
   */
  public static create({
    userId,
    feeRecordId,
    formData,
    requestSource,
  }: CreateFeeRecordCorrectionRequestTransientFormDataParams): FeeRecordCorrectionRequestTransientFormDataEntity {
    const data = new FeeRecordCorrectionRequestTransientFormDataEntity();
    data.userId = userId;
    data.feeRecordId = feeRecordId;
    data.formData = formData;
    data.updateLastUpdatedBy(requestSource);
    return data;
  }
}
