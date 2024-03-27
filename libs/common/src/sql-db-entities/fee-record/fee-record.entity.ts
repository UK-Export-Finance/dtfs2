import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportEntity } from '../utilisation-report';
import { Currency } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { CreateFeeRecordParams } from './fee-record.types';
import { MonetaryColumn, ExchangeRateColumn } from '../custom-columns';

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
  @MonetaryColumn()
  facilityUtilisation!: number;

  /**
   * Total amount of money accrued by UKEF for the GEF
   */
  @MonetaryColumn()
  totalFeesAccruedForThePeriod!: number;

  /**
   * The currency of the total amount of money accrued by UKEF for the GEF
   */
  @Column({ type: 'nvarchar' })
  totalFeesAccruedForThePeriodCurrency!: Currency;

  /**
   * The exchange rate from the {@link baseCurrency} to the {@link totalFeesAccruedForThePeriodCurrency}
   */
  @ExchangeRateColumn()
  totalFeesAccruedForThePeriodExchangeRate!: number;

  /**
   * The fees actually paid to UKEF by the bank
   */
  @MonetaryColumn()
  feesPaidToUkefForThePeriod!: number;

  /**
   * The currency of the fees actually paid to UKEF by the bank
   */
  @Column({ type: 'nvarchar' })
  feesPaidToUkefForThePeriodCurrency!: Currency;

  /**
   * The currency of the payment made to UKEF by the bank
   */
  @Column({ type: 'nvarchar' })
  paymentCurrency!: Currency;

  /**
   * The exchange rate from the {@link baseCurrency} to the {@link paymentCurrency}
   */
  @ExchangeRateColumn()
  paymentExchangeRate!: number;

  // TODO FN-1726 - when we have a status on this entity we should make this method name specific to the initial status
  static create({
    facilityId,
    exporter,
    baseCurrency,
    facilityUtilisation,
    totalFeesAccruedForThePeriod,
    totalFeesAccruedForThePeriodCurrency,
    totalFeesAccruedForThePeriodExchangeRate,
    feesPaidToUkefForThePeriod,
    feesPaidToUkefForThePeriodCurrency,
    paymentCurrency,
    paymentExchangeRate,
    requestSource,
  }: CreateFeeRecordParams): FeeRecordEntity {
    const feeRecord = new FeeRecordEntity();
    feeRecord.facilityId = facilityId;
    feeRecord.exporter = exporter;
    feeRecord.baseCurrency = baseCurrency;
    feeRecord.facilityUtilisation = facilityUtilisation;
    feeRecord.totalFeesAccruedForThePeriod = totalFeesAccruedForThePeriod;
    feeRecord.totalFeesAccruedForThePeriodCurrency = totalFeesAccruedForThePeriodCurrency;
    feeRecord.totalFeesAccruedForThePeriodExchangeRate = totalFeesAccruedForThePeriodExchangeRate;
    feeRecord.feesPaidToUkefForThePeriod = feesPaidToUkefForThePeriod;
    feeRecord.feesPaidToUkefForThePeriodCurrency = feesPaidToUkefForThePeriodCurrency;
    feeRecord.paymentCurrency = paymentCurrency;
    feeRecord.paymentExchangeRate = paymentExchangeRate;
    feeRecord.updateLastUpdatedBy(requestSource);
    return feeRecord;
  }
}
