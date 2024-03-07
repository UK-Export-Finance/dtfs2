import { DbRequestSource, UtilisationDataEntity } from '@ukef/dtfs2-common';
import { utilisationDataCsvRowToSqlEntity } from '.';
import { MOCK_UTILISATION_REPORT_RAW_CSV_DATA } from '../../api-tests/mocks/utilisation-reports/utilisation-report-raw-csv-data';
import { UtilisationReportRawCsvData } from '../types/utilisation-reports';

describe('utilisation-data.helper', () => {
  describe('utilisationDataCsvRowToSqlEntity', () => {
    const mockDate = new Date('2024-01');

    const requestSource: DbRequestSource = {
      platform: 'PORTAL',
      userId: 'abc123',
    };

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('returns an SQL entity', () => {
      // Act
      const utilisationDataEntity = utilisationDataCsvRowToSqlEntity({ dataEntry: MOCK_UTILISATION_REPORT_RAW_CSV_DATA, requestSource });

      // Assert
      expect(utilisationDataEntity instanceof UtilisationDataEntity).toBe(true);
    });

    it('converts the numeric string columns to numbers', () => {
      // Arrange
      const facilityUtilisation = 100;
      const totalFeesAccruedForTheMonth = 213.4;
      const totalFeesAccruedForTheMonthExchangeRate = 1.01;
      const monthlyFeesPaidToUkef = 35.41;
      const paymentExchangeRate = 2.5;
      const utilisationReportRawCsvData: UtilisationReportRawCsvData = {
        ...MOCK_UTILISATION_REPORT_RAW_CSV_DATA,
        'facility utilisation': facilityUtilisation.toString(),
        'total fees accrued for the period': totalFeesAccruedForTheMonth.toString(),
        'accrual exchange rate': totalFeesAccruedForTheMonthExchangeRate.toString(),
        'fees paid to ukef for the period': monthlyFeesPaidToUkef.toString(),
        'payment exchange rate': paymentExchangeRate.toString(),
      };

      // Act
      const utilisationDataEntity = utilisationDataCsvRowToSqlEntity({
        dataEntry: utilisationReportRawCsvData,
        requestSource,
      });

      // Assert
      expect(utilisationDataEntity).toEqual(
        expect.objectContaining({
          facilityUtilisation,
          totalFeesAccruedForTheMonth,
          totalFeesAccruedForTheMonthExchangeRate,
          monthlyFeesPaidToUkef,
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
      const utilisationDataCsvRow: UtilisationReportRawCsvData = {
        ...MOCK_UTILISATION_REPORT_RAW_CSV_DATA,
        'accrual exchange rate': testValue as string,
        'payment exchange rate': testValue as string,
      };

      // Act
      const utilisationDataEntity = utilisationDataCsvRowToSqlEntity({
        dataEntry: utilisationDataCsvRow,
        requestSource,
      });

      // Assert
      expect(utilisationDataEntity).toEqual(
        expect.objectContaining({
          totalFeesAccruedForTheMonthExchangeRate: 1,
          paymentExchangeRate: 1,
        }),
      );
    });
  });
});
