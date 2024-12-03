import {
  REQUEST_PLATFORM_TYPE,
  DbRequestSource,
  FeeRecordEntity,
  UtilisationReportRawCsvData,
  FeeRecordStatus,
  UtilisationReportEntity,
  CURRENCY,
  Currency,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import { feeRecordCsvRowToSqlEntity } from './fee-record-csv-row-mapper';
import { aUtilisationReportRawCsvData } from '../../test-helpers';

describe('fee-record-helpers', () => {
  describe('feeRecordCsvRowToSqlEntity', () => {
    const mockDate = new Date('2024-01');

    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.PORTAL,
      userId: 'abc123',
    };

    const report = new UtilisationReportEntity();

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns an SQL entity with the correct data', () => {
      // Act
      const rawCsvData = aUtilisationReportRawCsvData();
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: rawCsvData,
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity instanceof FeeRecordEntity).toEqual(true);
      expect(feeRecordEntity).toEqual(
        expect.objectContaining<Partial<FeeRecordEntity>>({
          facilityId: rawCsvData['ukef facility id'],
          exporter: rawCsvData.exporter,
          baseCurrency: rawCsvData['base currency'],
          facilityUtilisation: Number(rawCsvData['facility utilisation']),
          totalFeesAccruedForThePeriod: Number(rawCsvData['total fees accrued for the period']),
          totalFeesAccruedForThePeriodCurrency: rawCsvData['accrual currency'] as Currency,
          totalFeesAccruedForThePeriodExchangeRate: Number(rawCsvData['accrual exchange rate']),
          feesPaidToUkefForThePeriod: Number(rawCsvData['fees paid to ukef for the period']),
          feesPaidToUkefForThePeriodCurrency: rawCsvData['fees paid to ukef currency'],
          paymentCurrency: rawCsvData['payment currency'] as Currency,
          paymentExchangeRate: Number(rawCsvData['payment exchange rate']),
          lastUpdatedByIsSystemUser: false,
          lastUpdatedByPortalUserId: requestSource.userId,
          lastUpdatedByTfmUserId: null,
          report,
        }),
      );
    });

    const emptyValues: ('' | undefined | null)[] = [null, undefined, ''];

    it.each(emptyValues)('sets payment currency to fees paid to ukef currency when not provided: %s', (paymentCurrency?: '' | null) => {
      // Arrange
      const rawCsvData = aUtilisationReportRawCsvData();
      rawCsvData['fees paid to ukef currency'] = CURRENCY.GBP;
      rawCsvData['payment currency'] = paymentCurrency;

      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: rawCsvData,
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity.paymentCurrency).toEqual(CURRENCY.GBP);
    });

    it.each(emptyValues)('sets total fees accrued currency to the base currency when not provided: %s', (accrualCurrency?: '' | null) => {
      // Arrange
      const rawCsvData = aUtilisationReportRawCsvData();
      rawCsvData['base currency'] = CURRENCY.GBP;
      rawCsvData['accrual currency'] = accrualCurrency;

      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: rawCsvData,
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity.totalFeesAccruedForThePeriodCurrency).toEqual(CURRENCY.GBP);
    });

    it('sets the entity status to TO_DO when fees paid to ukef for the period is non zero', () => {
      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: { ...aUtilisationReportRawCsvData(), 'fees paid to ukef for the period': '0.01' },
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity instanceof FeeRecordEntity).toEqual(true);
      expect(feeRecordEntity.status).toEqual<FeeRecordStatus>(FEE_RECORD_STATUS.TO_DO);
    });

    it(`sets the entity status to ${FEE_RECORD_STATUS.MATCH} when fees paid to ukef for the period is zero`, () => {
      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: { ...aUtilisationReportRawCsvData(), 'fees paid to ukef for the period': '0.00' },
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity instanceof FeeRecordEntity).toEqual(true);
      expect(feeRecordEntity.status).toEqual<FeeRecordStatus>(FEE_RECORD_STATUS.MATCH);
    });

    it('converts the numeric string columns to numbers', () => {
      // Arrange
      const facilityUtilisation = 100;
      const totalFeesAccruedForThePeriod = 213.4;
      const totalFeesAccruedForThePeriodExchangeRate = 1.01;
      const feesPaidToUkefForThePeriod = 35.41;
      const paymentExchangeRate = 2.5;
      const utilisationReportRawCsvData: UtilisationReportRawCsvData = {
        ...aUtilisationReportRawCsvData(),
        'facility utilisation': facilityUtilisation.toString(),
        'total fees accrued for the period': totalFeesAccruedForThePeriod.toString(),
        'accrual exchange rate': totalFeesAccruedForThePeriodExchangeRate.toString(),
        'fees paid to ukef for the period': feesPaidToUkefForThePeriod.toString(),
        'payment exchange rate': paymentExchangeRate.toString(),
      };

      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: utilisationReportRawCsvData,
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity).toEqual(
        expect.objectContaining({
          facilityUtilisation,
          totalFeesAccruedForThePeriod,
          totalFeesAccruedForThePeriodExchangeRate,
          feesPaidToUkefForThePeriod,
          paymentExchangeRate,
        }),
      );
    });

    it.each`
      condition          | testValue
      ${'undefined'}     | ${undefined}
      ${'null'}          | ${null}
      ${'empty strings'} | ${''}
    `('uses the default value of 1 when the exchange rate entries are $condition', ({ testValue }) => {
      // Arrange
      const feeRecordCsvRow: UtilisationReportRawCsvData = {
        ...aUtilisationReportRawCsvData(),
        'accrual exchange rate': testValue as string,
        'payment exchange rate': testValue as string,
      };

      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: feeRecordCsvRow,
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity).toEqual(
        expect.objectContaining({
          totalFeesAccruedForThePeriodExchangeRate: 1,
          paymentExchangeRate: 1,
        }),
      );
    });
  });
});
