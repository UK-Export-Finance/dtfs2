import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity, FacilityUtilisationDataEntity, PaymentEntity } from '../../sql-db-entities';
import { Currency, FeeRecordStatus, ReportPeriod } from '../../types';
import { FacilityUtilisationDataEntityMockBuilder } from './facility-utilisation-data.entity.mock-builder';

/**
 * Gets the previous report period based on a monthly reporting
 * schedule. This is used because the attached facility utilisation
 * data entity should normally be referencing the previous report
 * period (where the attached report report period is the current
 * report period)
 * @param reportPeriod - The current report period
 * @returns The previous report period
 */
const getPreviousMonthlyReportPeriod = (reportPeriod: ReportPeriod): ReportPeriod => {
  const previousReportPeriodIsInPreviousYear = reportPeriod.start.month === 1;
  const previousReportPeriodMonth = previousReportPeriodIsInPreviousYear ? 12 : reportPeriod.start.month - 1;
  const previousReportPeriodYear = previousReportPeriodIsInPreviousYear ? reportPeriod.start.year - 1 : reportPeriod.start.year;
  return {
    start: { month: previousReportPeriodMonth, year: previousReportPeriodYear },
    end: { month: previousReportPeriodMonth, year: previousReportPeriodYear },
  };
};

export class FeeRecordEntityMockBuilder {
  private readonly feeRecord: FeeRecordEntity;

  private constructor(feeRecord: FeeRecordEntity) {
    this.feeRecord = feeRecord;
  }

  public static forReport(report: UtilisationReportEntity): FeeRecordEntityMockBuilder {
    const data = new FeeRecordEntity();
    const userId = '5ce819935e539c343f141ece';
    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId,
    };

    data.id = 1;
    data.facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId('12345678')
      .withReportPeriod(getPreviousMonthlyReportPeriod(report.reportPeriod))
      .build();
    data.facilityId = '12345678';
    data.report = report;
    data.exporter = 'test exporter';
    data.baseCurrency = 'GBP';
    data.facilityUtilisation = 100;
    data.totalFeesAccruedForThePeriod = 100;
    data.totalFeesAccruedForThePeriodCurrency = 'GBP';
    data.totalFeesAccruedForThePeriodExchangeRate = 1;
    data.feesPaidToUkefForThePeriod = 100;
    data.feesPaidToUkefForThePeriodCurrency = 'GBP';
    data.paymentCurrency = 'GBP';
    data.paymentExchangeRate = 1;
    data.status = 'TO_DO';
    data.payments = [];
    data.fixedFeeAdjustment = null;
    data.principalBalanceAdjustment = null;
    data.reconciledByUserId = null;
    data.dateReconciled = null;
    data.updateLastUpdatedBy(requestSource);
    return new FeeRecordEntityMockBuilder(data);
  }

  public withId(id: number): FeeRecordEntityMockBuilder {
    this.feeRecord.id = id;
    return this;
  }

  public withFacilityId(facilityId: string): FeeRecordEntityMockBuilder {
    this.feeRecord.facilityId = facilityId;
    this.feeRecord.facilityUtilisationData.id = facilityId;
    return this;
  }

  public withFacilityUtilisationData(facilityUtilisationData: FacilityUtilisationDataEntity): FeeRecordEntityMockBuilder {
    this.feeRecord.facilityUtilisationData = facilityUtilisationData;
    this.feeRecord.facilityId = facilityUtilisationData.id;
    return this;
  }

  public withExporter(exporter: string): FeeRecordEntityMockBuilder {
    this.feeRecord.exporter = exporter;
    return this;
  }

  public withBaseCurrency(currency: Currency): FeeRecordEntityMockBuilder {
    this.feeRecord.baseCurrency = currency;
    return this;
  }

  public withFacilityUtilisation(facilityUtilisation: number): FeeRecordEntityMockBuilder {
    this.feeRecord.facilityUtilisation = facilityUtilisation;
    return this;
  }

  public withTotalFeesAccruedForThePeriod(totalFeesAccruedForThePeriod: number): FeeRecordEntityMockBuilder {
    this.feeRecord.totalFeesAccruedForThePeriod = totalFeesAccruedForThePeriod;
    return this;
  }

  public withTotalFeesAccruedForThePeriodCurrency(currency: Currency): FeeRecordEntityMockBuilder {
    this.feeRecord.totalFeesAccruedForThePeriodCurrency = currency;
    return this;
  }

  public withTotalFeesAccruedForThePeriodExchangeRate(exchangeRate: number): FeeRecordEntityMockBuilder {
    this.feeRecord.totalFeesAccruedForThePeriodExchangeRate = exchangeRate;
    return this;
  }

  public withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod: number): FeeRecordEntityMockBuilder {
    this.feeRecord.feesPaidToUkefForThePeriod = feesPaidToUkefForThePeriod;
    return this;
  }

  public withFeesPaidToUkefForThePeriodCurrency(currency: Currency): FeeRecordEntityMockBuilder {
    this.feeRecord.feesPaidToUkefForThePeriodCurrency = currency;
    return this;
  }

  public withPaymentCurrency(currency: Currency): FeeRecordEntityMockBuilder {
    this.feeRecord.paymentCurrency = currency;
    return this;
  }

  public withPaymentExchangeRate(exchangeRate: number): FeeRecordEntityMockBuilder {
    this.feeRecord.paymentExchangeRate = exchangeRate;
    return this;
  }

  public withStatus(status: FeeRecordStatus): FeeRecordEntityMockBuilder {
    this.feeRecord.status = status;
    return this;
  }

  public withPayments(payments: PaymentEntity[]): FeeRecordEntityMockBuilder {
    this.feeRecord.payments = payments;
    return this;
  }

  public withFixedFeeAdjustment(fixedFeeAdjustment: number | null): FeeRecordEntityMockBuilder {
    this.feeRecord.fixedFeeAdjustment = fixedFeeAdjustment;
    return this;
  }

  public withPrincipalBalanceAdjustment(principalBalanceAdjustment: number | null): FeeRecordEntityMockBuilder {
    this.feeRecord.principalBalanceAdjustment = principalBalanceAdjustment;
    return this;
  }

  public withReconciledByUserId(reconciledByUserId: string | null): FeeRecordEntityMockBuilder {
    this.feeRecord.reconciledByUserId = reconciledByUserId;
    return this;
  }

  public withDateReconciled(dateReconciled: Date | null): FeeRecordEntityMockBuilder {
    this.feeRecord.dateReconciled = dateReconciled;
    return this;
  }

  public withLastUpdatedByIsSystemUser(isSystemUser: boolean): FeeRecordEntityMockBuilder {
    this.feeRecord.lastUpdatedByIsSystemUser = isSystemUser;
    return this;
  }

  public withLastUpdatedByPortalUserId(userId: string | null): FeeRecordEntityMockBuilder {
    this.feeRecord.lastUpdatedByPortalUserId = userId;
    return this;
  }

  public withLastUpdatedByTfmUserId(userId: string | null): FeeRecordEntityMockBuilder {
    this.feeRecord.lastUpdatedByTfmUserId = userId;
    return this;
  }

  public build(): FeeRecordEntity {
    return this.feeRecord;
  }
}
