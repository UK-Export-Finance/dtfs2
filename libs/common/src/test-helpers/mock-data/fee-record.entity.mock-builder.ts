import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '../../sql-db-entities';
import { Currency, FeeRecordStatus } from '../../types';

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
    data.facilityId = '123456789';
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
    data.updateLastUpdatedBy(requestSource);
    return new FeeRecordEntityMockBuilder(data);
  }

  public withId(id: number): FeeRecordEntityMockBuilder {
    this.feeRecord.id = id;
    return this;
  }

  public withFacilityId(facilityId: string): FeeRecordEntityMockBuilder {
    this.feeRecord.facilityId = facilityId;
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

  public build(): FeeRecordEntity {
    return this.feeRecord;
  }
}
