import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Big from 'big.js';
import { UtilisationReportEntity } from '../utilisation-report';
import { Currency, FeeRecordStatus } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { CreateFeeRecordParams, RemoveAllPaymentsParams, UpdateWithKeyingDataParams, UpdateWithStatusParams } from './fee-record.types';
import { MonetaryColumn, ExchangeRateColumn } from '../custom-columns';
import { PaymentEntity } from '../payment';
import { FacilityUtilisationDataEntity } from '../facility-utilisation-data';

@Entity('FeeRecord')
export class FeeRecordEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The `_id` of the associated facility in the 'facilities' MongoDB collection
   */
  @Column({ type: 'nvarchar', length: '10' })
  facilityId!: string;

  /**
   * The linked facility utilisation data
   */
  @ManyToOne(() => FacilityUtilisationDataEntity, (facilityUtilisationData) => facilityUtilisationData.feeRecords, {
    nullable: false,
    eager: true,
    cascade: ['insert'],
  })
  @JoinColumn({ name: 'facilityId' })
  facilityUtilisationData!: FacilityUtilisationDataEntity;

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
  @Column({ type: 'nvarchar', default: 'TO_DO' })
  status!: FeeRecordStatus;

  /**
   * The payments associated with the fee record
   */
  @ManyToMany(() => PaymentEntity, (payment) => payment.feeRecords, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
  })
  @JoinTable()
  payments!: PaymentEntity[];

  /**
   * The keying sheet fixed fee adjustment
   */
  @MonetaryColumn({ nullable: true })
  fixedFeeAdjustment!: number | null;

  /**
   * The keying sheet premium accrual balance adjustment
   */
  @MonetaryColumn({ nullable: true })
  premiumAccrualBalanceAdjustment!: number | null;

  /**
   * The keying sheet principal balance adjustment
   */
  @MonetaryColumn({ nullable: true })
  principalBalanceAdjustment!: number | null;

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
    feeRecord.payments = [];
    feeRecord.fixedFeeAdjustment = null;
    feeRecord.premiumAccrualBalanceAdjustment = null;
    feeRecord.principalBalanceAdjustment = null;
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

  public updateWithStatus({ status, requestSource }: UpdateWithStatusParams): void {
    this.status = status;
    this.updateLastUpdatedBy(requestSource);
  }

  public updateWithKeyingData({
    fixedFeeAdjustment,
    premiumAccrualBalanceAdjustment,
    principalBalanceAdjustment,
    requestSource,
  }: UpdateWithKeyingDataParams): void {
    this.status = 'READY_TO_KEY';
    this.fixedFeeAdjustment = fixedFeeAdjustment;
    this.premiumAccrualBalanceAdjustment = premiumAccrualBalanceAdjustment;
    this.principalBalanceAdjustment = principalBalanceAdjustment;
    this.updateLastUpdatedBy(requestSource);
  }

  public removeAllPayments({ requestSource }: RemoveAllPaymentsParams): void {
    this.payments = [];
    this.status = 'TO_DO';
    this.updateLastUpdatedBy(requestSource);
  }
}
