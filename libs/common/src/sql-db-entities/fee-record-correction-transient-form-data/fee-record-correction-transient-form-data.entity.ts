import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AuditableBaseEntity } from '../base-entities';
import { CreateFeeRecordCorrectionTransientFormDataParams } from './fee-record-correction-transient-form-data.types';
import { RecordCorrectionTransientFormData } from '../../types';

/**
 * Entity representing facility utilisation data
 */
@Entity('FeeRecordCorrectionTransientFormData')
export class FeeRecordCorrectionTransientFormDataEntity extends AuditableBaseEntity {
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
   * @returns The deserialized form data as RecordCorrectionTransientFormData
   */
  get formData(): RecordCorrectionTransientFormData {
    return JSON.parse(this.formDataSerialized) as RecordCorrectionTransientFormData;
  }

  /**
   * Sets the form data by serializing it to a JSON string
   * @param value - The form data to be serialized and stored
   */
  set formData(value: RecordCorrectionTransientFormData) {
    this.formDataSerialized = JSON.stringify(value);
  }

  /**
   * Creates a new FeeRecordCorrectionTransientFormDataEntity
   * @param feeRecordCorrectionTransientFormData - Parameters for creating the entity
   * @param feeRecordCorrectionTransientFormData.userId - The user ID associated with the entity
   * @param feeRecordCorrectionTransientFormData.feeRecordId - The fee record ID associated with the entity
   * @param feeRecordCorrectionTransientFormData.formData - The form data of the entity
   * @param feeRecordCorrectionTransientFormData.requestSource - The source of the request
   * @returns The created entity
   */
  public static create({
    userId,
    feeRecordId,
    formData,
    requestSource,
  }: CreateFeeRecordCorrectionTransientFormDataParams): FeeRecordCorrectionTransientFormDataEntity {
    const data = new FeeRecordCorrectionTransientFormDataEntity();
    data.userId = userId;
    data.feeRecordId = feeRecordId;
    data.formData = formData;
    data.updateLastUpdatedBy(requestSource);
    return data;
  }
}
