import { Column } from 'typeorm';
import { Currency } from '../../types';
import { MonetaryColumn } from '../custom-columns';

/**
 * Partial entity for the correction values of a fee record
 *
 * The fields in this entity are nullable, and are used to store
 * the previous and corrected values of the fee record.
 *
 * Any field that has been corrected as part of the correction
 * will take a non-null value, and the other fields will be null.
 */
export class CorrectionValuesPartialEntity {
  /**
   * The `_id` of the associated facility in the 'facilities' MongoDB collection
   */
  @Column({ type: 'nvarchar', length: '10', nullable: true })
  facilityId!: string | null;

  /**
   * The current utilisation (drawdown) of the facility by the exporter
   */
  @MonetaryColumn({ nullable: true })
  facilityUtilisation!: number | null;

  /**
   * The fees actually paid to UKEF by the bank
   */
  @MonetaryColumn({ nullable: true })
  feesPaidToUkefForThePeriod!: number | null;

  /**
   * The currency of the fees actually paid to UKEF by the bank
   */
  @Column({ type: 'nvarchar', nullable: true })
  feesPaidToUkefForThePeriodCurrency!: Currency | null;
}
