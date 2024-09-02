import { DbRequestSource, FeeRecordEntity, FeeRecordStatus, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { feeRecordCsvRowToSqlEntity } from './fee-record-helpers';
import { UtilisationReportRawCsvData } from '../types/utilisation-reports';
import { aUtilisationReportRawCsvData } from '../../test-helpers';

describe('fee-record-helpers', () => {
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
      const rawCsvData = aUtilisationReportRawCsvData();
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: rawCsvData,
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity instanceof FeeRecordEntity).toBe(true);
      expect(feeRecordEntity).toEqual(
        expect.objectContaining<Partial<FeeRecordEntity>>({
          facilityId: rawCsvData['ukef facility id'],
          exporter: rawCsvData.exporter,
          baseCurrency: rawCsvData['base currency'],
          facilityUtilisation: Number(rawCsvData['facility utilisation']),
          totalFeesAccruedForThePeriod: Number(rawCsvData['total fees accrued for the period']),
          totalFeesAccruedForThePeriodCurrency: rawCsvData['accrual currency'],
          totalFeesAccruedForThePeriodExchangeRate: Number(rawCsvData['accrual exchange rate']),
          feesPaidToUkefForThePeriod: Number(rawCsvData['fees paid to ukef for the period']),
          feesPaidToUkefForThePeriodCurrency: rawCsvData['fees paid to ukef currency'],
          paymentCurrency: rawCsvData['payment currency'],
          paymentExchangeRate: Number(rawCsvData['payment exchange rate']),
          lastUpdatedByIsSystemUser: false,
          lastUpdatedByPortalUserId: requestSource.userId,
          lastUpdatedByTfmUserId: null,
          report,
        }),
      );
    });

    it('sets the entity status to TO_DO when fees paid to ukef for the period is non zero', () => {
      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: { ...aUtilisationReportRawCsvData(), 'fees paid to ukef for the period': '0.01' },
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity instanceof FeeRecordEntity).toBe(true);
      expect(feeRecordEntity.status).toEqual<FeeRecordStatus>('TO_DO');
    });

    it('sets the entity status to MATCH when fees paid to ukef for the period is zero', () => {
      // Act
      const feeRecordEntity = feeRecordCsvRowToSqlEntity({
        dataEntry: { ...aUtilisationReportRawCsvData(), 'fees paid to ukef for the period': '0.00' },
        requestSource,
        report,
      });

      // Assert
      expect(feeRecordEntity instanceof FeeRecordEntity).toBe(true);
      expect(feeRecordEntity.status).toEqual<FeeRecordStatus>('MATCH');
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
