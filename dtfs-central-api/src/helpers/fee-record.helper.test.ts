import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { feeRecordCsvRowToSqlEntity } from './fee-record.helper';
import { MOCK_UTILISATION_REPORT_RAW_CSV_DATA } from '../../api-tests/mocks/utilisation-reports/utilisation-report-raw-csv-data';
import { UtilisationReportRawCsvData } from '../types/utilisation-reports';

describe('fee-record.helper', () => {
  describe('feeRecordCsvRowToSqlEntity', () => {
    const mockDate = new Date('2024-01');

    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
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
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: MOCK_UTILISATION_REPORT_RAW_CSV_DATA,
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity instanceof FeeRecordEntity).toBe(true);
      expect(feeRecordEntity).toEqual(
        expect.objectContaining<Partial<FeeRecordEntity>>({
          facilityId: MOCK_UTILISATION_REPORT_RAW_CSV_DATA['ukef facility id'],
          exporter: MOCK_UTILISATION_REPORT_RAW_CSV_DATA.exporter,
          baseCurrency: MOCK_UTILISATION_REPORT_RAW_CSV_DATA['base currency'],
          facilityUtilisation: Number(MOCK_UTILISATION_REPORT_RAW_CSV_DATA['facility utilisation']),
          totalFeesAccruedForThePeriod: Number(MOCK_UTILISATION_REPORT_RAW_CSV_DATA['total fees accrued for the period']),
          totalFeesAccruedForThePeriodCurrency: MOCK_UTILISATION_REPORT_RAW_CSV_DATA['accrual currency'],
          totalFeesAccruedForThePeriodExchangeRate: Number(MOCK_UTILISATION_REPORT_RAW_CSV_DATA['accrual exchange rate']),
          feesPaidToUkefForThePeriod: Number(MOCK_UTILISATION_REPORT_RAW_CSV_DATA['fees paid to ukef for the period']),
          feesPaidToUkefForThePeriodCurrency: MOCK_UTILISATION_REPORT_RAW_CSV_DATA['fees paid to ukef currency'],
          paymentCurrency: MOCK_UTILISATION_REPORT_RAW_CSV_DATA['payment currency'],
          paymentExchangeRate: Number(MOCK_UTILISATION_REPORT_RAW_CSV_DATA['payment exchange rate']),
          lastUpdatedByIsSystemUser: false,
          lastUpdatedByPortalUserId: requestSource.userId,
          lastUpdatedByTfmUserId: null,
          report,
        }),
      );
    });

    it('converts the numeric string columns to numbers', () => {
      // Arrange
      const facilityUtilisation = 100;
      const totalFeesAccruedForThePeriod = 213.4;
      const totalFeesAccruedForThePeriodExchangeRate = 1.01;
      const feesPaidToUkefForThePeriod = 35.41;
      const paymentExchangeRate = 2.5;
      const utilisationReportRawCsvData: UtilisationReportRawCsvData = {
        ...MOCK_UTILISATION_REPORT_RAW_CSV_DATA,
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
        ...MOCK_UTILISATION_REPORT_RAW_CSV_DATA,
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
