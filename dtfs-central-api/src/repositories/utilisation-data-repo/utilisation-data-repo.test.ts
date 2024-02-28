import { MONGO_DB_COLLECTIONS, ReportPeriod } from '@ukef/dtfs2-common';
import { saveUtilisationData } from './utilisation-data-repo';
import db from '../../drivers/db-client';
import { UtilisationReportRawCsvData } from '../../types/utilisation-reports';

describe('utilisation-data-repo', () => {
  describe('saveUtilisationData', () => {
    it('maps the data and correctly saves to the database', async () => {
      // Arrange
      const insertManySpy = jest.fn();
      const getCollectionMock = jest.fn().mockResolvedValue({
        insertMany: insertManySpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const mockReportData: UtilisationReportRawCsvData = {
        'ukef facility id': '123',
        exporter: 'test exporter',
        'base currency': 'GBP',
        'facility utilisation': '300',
        'total fees accrued for the period': '200',
        'accrual currency': 'USD',
        'accrual exchange rate': '1.23',
        'fees paid to ukef for the period': '100',
        'fees paid to ukef currency': 'GBP',
        'payment currency': 'USD',
        'payment exchange rate': '1.23',
      };
      const mockReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2021,
        },
        end: {
          month: 1,
          year: 2021,
        },
      };
      const mockBank = {
        id: '456',
        name: 'Test bank',
      };
      const mockReportId = '789';

      // Act
      await saveUtilisationData([mockReportData], mockReportPeriod, mockBank, mockReportId);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.UTILISATION_DATA);
      expect(insertManySpy).toHaveBeenCalledWith([
        {
          facilityId: mockReportData['ukef facility id'],
          reportId: mockReportId,
          bankId: mockBank.id,
          reportPeriod: {
            start: {
              month: 1,
              year: 2021,
            },
            end: {
              month: 1,
              year: 2021,
            },
          },
          exporter: mockReportData.exporter,
          baseCurrency: mockReportData['base currency'],
          facilityUtilisation: Number(mockReportData['facility utilisation']),
          totalFeesAccruedForTheMonth: Number(mockReportData['total fees accrued for the period']),
          totalFeesAccruedForTheMonthCurrency: mockReportData['accrual currency'],
          totalFeesAccruedForTheMonthExchangeRate: Number(mockReportData['accrual exchange rate']),
          monthlyFeesPaidToUkef: Number(mockReportData['fees paid to ukef for the period']),
          monthlyFeesPaidToUkefCurrency: mockReportData['fees paid to ukef currency'],
          paymentCurrency: mockReportData['payment currency'],
          paymentExchangeRate: Number(mockReportData['payment exchange rate']),
          payments: null,
        },
      ]);
    });
  });
});
