import { DbRequestSource, UtilisationDataEntity, UtilisationReportEntity, getDbAuditUpdatedByUserId } from '../../sql-db-entities';
import { Currency } from '../../types';

export class UtilisationDataEntityMockBuilder {
  private readonly data: UtilisationDataEntity;

  private constructor(data: UtilisationDataEntity) {
    this.data = data;
  }

  public static forReport(report: UtilisationReportEntity): UtilisationDataEntityMockBuilder {
    const data = new UtilisationDataEntity();
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
    data.totalFeesAccruedForTheMonth = 100;
    data.totalFeesAccruedForTheMonthCurrency = 'GBP';
    data.totalFeesAccruedForTheMonthExchangeRate = 1;
    data.monthlyFeesPaidToUkef = 100;
    data.monthlyFeesPaidToUkefCurrency = 'GBP';
    data.paymentCurrency = 'GBP';
    data.paymentExchangeRate = 1;
    data.updatedByUserId = getDbAuditUpdatedByUserId(requestSource);
    return new UtilisationDataEntityMockBuilder(data);
  }

  public withId(id: number): UtilisationDataEntityMockBuilder {
    this.data.id = id;
    return this;
  }

  public withFacilityId(facilityId: string): UtilisationDataEntityMockBuilder {
    this.data.facilityId = facilityId;
    return this;
  }

  public withExporter(exporter: string): UtilisationDataEntityMockBuilder {
    this.data.exporter = exporter;
    return this;
  }

  public withBaseCurrency(currency: Currency): UtilisationDataEntityMockBuilder {
    this.data.baseCurrency = currency;
    return this;
  }

  public withFacilityUtilisation(facilityUtilisation: number): UtilisationDataEntityMockBuilder {
    this.data.facilityUtilisation = facilityUtilisation;
    return this;
  }

  public withTotalFeesAccruedForTheMonth(totalFeesAccruedForTheMonth: number): UtilisationDataEntityMockBuilder {
    this.data.totalFeesAccruedForTheMonth = totalFeesAccruedForTheMonth;
    return this;
  }

  public withTotalFeesAccruedForTheMonthCurrency(totalFeesAccruedForTheMonthCurrency: Currency): UtilisationDataEntityMockBuilder {
    this.data.totalFeesAccruedForTheMonthCurrency = totalFeesAccruedForTheMonthCurrency;
    return this;
  }

  public withTotalFeesAccruedForTheMonthExchangeRate(exchangeRate: number): UtilisationDataEntityMockBuilder {
    this.data.totalFeesAccruedForTheMonthExchangeRate = exchangeRate;
    return this;
  }

  public withMonthlyFeesPaidToUkef(monthlyFeesPaidToUkef: number): UtilisationDataEntityMockBuilder {
    this.data.monthlyFeesPaidToUkef = monthlyFeesPaidToUkef;
    return this;
  }

  public withMonthlyFeesPaidToUkefCurrency(currency: Currency): UtilisationDataEntityMockBuilder {
    this.data.monthlyFeesPaidToUkefCurrency = currency;
    return this;
  }

  public withPaymentCurrency(currency: Currency): UtilisationDataEntityMockBuilder {
    this.data.paymentCurrency = currency;
    return this;
  }

  public withPaymentExchangeRate(exchangeRate: number): UtilisationDataEntityMockBuilder {
    this.data.paymentExchangeRate = exchangeRate;
    return this;
  }

  public build(): UtilisationDataEntity {
    return this.data;
  }
}
