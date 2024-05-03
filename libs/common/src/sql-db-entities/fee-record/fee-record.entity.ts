import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Big from 'big.js';
import { UtilisationReportEntity } from '../utilisation-report';
import { Currency, FeeRecordStatus } from '../../types';
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
    onDelete: 'CASCADE',
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
   * The exchange rate from the {@link paymentCurrency} to the {@link feesPaidToUkefForThePeriodCurrency}
   *
   * For example, for a fee record with `feesPaidToUkefForThePeriod` equal to `100.00`,
   * `feesPaidToUkefForThePeriodCurrency` equal to `'EUR'`, `paymentCurrency` equal to `'GBP'` and
   * `paymentExchangeRate` equal to `1.1`, the fees paid to ukef for the period in the payment currency
   * would be `100.00 ('EUR') / 1.1 = 90.91 ('GBP')`.
   */
  @ExchangeRateColumn()
  paymentExchangeRate!: number;

  /**
   * Status code representing the reconciliation state of the fee record
   */
  @Column({ type: 'nvarchar' })
  status!: FeeRecordStatus;

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
    status,
    requestSource,
    report,
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
    feeRecord.status = status;
    feeRecord.report = report;
    feeRecord.updateLastUpdatedBy(requestSource);
    return feeRecord;
  }

  public getFeesPaidToUkefForThePeriodInThePaymentCurrency(): number {
    if (this.paymentCurrency === this.feesPaidToUkefForThePeriodCurrency) {
      return this.feesPaidToUkefForThePeriod;
    }

    const feesPaidToUkefForThePeriodAsBig = new Big(this.feesPaidToUkefForThePeriod);
    const paymentExchangeRateAsBig = new Big(this.paymentExchangeRate);
    const precision = 2;
    return feesPaidToUkefForThePeriodAsBig.div(paymentExchangeRateAsBig).round(precision).toNumber();
  }
}
