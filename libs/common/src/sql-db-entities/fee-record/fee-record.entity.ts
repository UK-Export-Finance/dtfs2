import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportEntity } from '../utilisation-report';
import { Currency } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { CreateFeeRecordParams } from './fee-record.types';
import { getDbAuditUpdatedByUserId } from '../helpers';

@Entity('FeeRecord')
export class FeeRecordEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The `_id` of the associated facility in the 'facilities' MongoDB collection
   */
  @Column()
  facilityId!: string;

  /**
   * The associated report from the UtilisationReport table
   */
  @ManyToOne(() => UtilisationReportEntity, (report) => report.feeRecords, {
    nullable: false,
  })
  report!: UtilisationReportEntity;

  /**
   * Name of the exporter that the GEF is on behalf of
   */
  @Column()
  exporter!: string;

  /**
   * Currency of the facility that the fee record is for
   */
  @Column({ type: 'nvarchar' })
  baseCurrency!: Currency;

  /**
   * The current utilisation (drawdown) of the facility by the exporter
   */
  @Column()
  facilityUtilisation!: number;

  /**
   * Total amount of money accrued by UKEF for the GEF
   */
  @Column()
  totalFeesAccruedForTheMonth!: number;

  /**
   * The currency of the total amount of money accrued by UKEF for the GEF
   */
  @Column({ type: 'nvarchar' })
  totalFeesAccruedForTheMonthCurrency!: Currency;

  /**
   * The exchange rate from the `baseCurrency` to the `totalFeesAccruedForTheMonthCurrency`
   */
  @Column()
  totalFeesAccruedForTheMonthExchangeRate!: number;

  /**
   * The fees actually paid to UKEF by the bank
   */
  @Column()
  monthlyFeesPaidToUkef!: number;

  /**
   * The currency of the fees actually paid to UKEF by the bank
   */
  @Column({ type: 'nvarchar' })
  monthlyFeesPaidToUkefCurrency!: Currency;

  /**
   * The currency of the payment made to UKEF by the bank
   */
  @Column({ type: 'nvarchar' })
  paymentCurrency!: Currency;

  /**
   * The exchange rate from the `baseCurrency` to the `paymentCurrency`
   */
  @Column()
  paymentExchangeRate!: number;

  // TODO FN-1726 - when we have a status on this entity we should make this method name specific to the initial status
  static create({
    facilityId,
    exporter,
    baseCurrency,
    facilityUtilisation,
    totalFeesAccruedForTheMonth,
    totalFeesAccruedForTheMonthCurrency,
    totalFeesAccruedForTheMonthExchangeRate,
    monthlyFeesPaidToUkef,
    monthlyFeesPaidToUkefCurrency,
    paymentCurrency,
    paymentExchangeRate,
    requestSource,
  }: CreateFeeRecordParams): FeeRecordEntity {
    const feeRecord = new FeeRecordEntity();
    feeRecord.facilityId = facilityId;
    feeRecord.exporter = exporter;
    feeRecord.baseCurrency = baseCurrency;
    feeRecord.facilityUtilisation = facilityUtilisation;
    feeRecord.totalFeesAccruedForTheMonth = totalFeesAccruedForTheMonth;
    feeRecord.totalFeesAccruedForTheMonthCurrency = totalFeesAccruedForTheMonthCurrency;
    feeRecord.totalFeesAccruedForTheMonthExchangeRate = totalFeesAccruedForTheMonthExchangeRate;
    feeRecord.monthlyFeesPaidToUkef = monthlyFeesPaidToUkef;
    feeRecord.monthlyFeesPaidToUkefCurrency = monthlyFeesPaidToUkefCurrency;
    feeRecord.paymentCurrency = paymentCurrency;
    feeRecord.paymentExchangeRate = paymentExchangeRate;
    feeRecord.updatedByUserId = getDbAuditUpdatedByUserId(requestSource);
    return feeRecord;
  }
}
