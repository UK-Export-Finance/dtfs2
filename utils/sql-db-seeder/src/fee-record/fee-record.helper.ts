import { faker } from '@faker-js/faker';
import { CURRENCY, Currency, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { getExchangeRate } from '../helpers';

const getRandomCurrency = (): Currency => faker.helpers.arrayElement(Object.values(CURRENCY));

const createRandomFeeRecordForReport = (report: UtilisationReportEntity): FeeRecordEntity => {
  const feeRecord = new FeeRecordEntity();

  feeRecord.report = report;

  feeRecord.facilityId = faker.string.numeric(8);
  feeRecord.exporter = faker.company.name();
  feeRecord.baseCurrency = getRandomCurrency();
  feeRecord.facilityUtilisation = Number(faker.finance.amount({ min: 10000000, max: 20000000 }));

  const minimumAccrualAmount = feeRecord.facilityUtilisation * 0.005;
  const maximumAccrualAmount = feeRecord.facilityUtilisation * 0.01;

  feeRecord.totalFeesAccruedForThePeriod = Number(
    faker.finance.amount({
      min: minimumAccrualAmount,
      max: maximumAccrualAmount,
    }),
  );
  feeRecord.totalFeesAccruedForThePeriodCurrency = getRandomCurrency();
  feeRecord.totalFeesAccruedForThePeriodExchangeRate = getExchangeRate({
    from: feeRecord.baseCurrency,
    to: feeRecord.totalFeesAccruedForThePeriodCurrency,
  });

  feeRecord.feesPaidToUkefForThePeriod = feeRecord.totalFeesAccruedForThePeriod;
  feeRecord.feesPaidToUkefForThePeriodCurrency = feeRecord.totalFeesAccruedForThePeriodCurrency;

  feeRecord.paymentCurrency = getRandomCurrency();
  feeRecord.paymentExchangeRate = getExchangeRate({
    from: feeRecord.paymentCurrency,
    to: feeRecord.feesPaidToUkefForThePeriodCurrency,
  });

  feeRecord.status = 'TO_DO';

  feeRecord.updateLastUpdatedBy({ platform: 'SYSTEM' });

  return feeRecord;
};

export const createRandomFeeRecordsForReport = (numberOfFeeRecords: number, report: UtilisationReportEntity): FeeRecordEntity[] => {
  const feeRecords: FeeRecordEntity[] = [];
  while (feeRecords.length !== numberOfFeeRecords) {
    feeRecords.push(createRandomFeeRecordForReport(report));
  }
  return feeRecords;
};
