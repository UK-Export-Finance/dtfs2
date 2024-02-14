import { saveUtilisationData, getAllUtilisationDataForReport } from './utilisation-data-repo';
import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';
import { MOCK_UTILISATION_DATA } from '../../../api-tests/mocks/utilisation-reports/utilisation-data';
import { MOCK_UTILISATION_REPORT } from '../../../api-tests/mocks/utilisation-reports/utilisation-reports';
import { ReportPeriod, UtilisationReportRawCsvData } from '../../types/utilisation-reports';

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
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_DATA);
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

  describe('getAllUtilisationDataForReport', () => {
    it('makes a request to the DB with the specified reportId, month, and year', async () => {
      // Arrange
      const findMock = jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue(MOCK_UTILISATION_DATA),
      }));
      const getCollectionMock = jest.fn().mockResolvedValue({
        find: findMock,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      const response = await getAllUtilisationDataForReport(MOCK_UTILISATION_REPORT);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_DATA);
      expect(findMock).toHaveBeenCalledWith({
        reportId: { $eq: MOCK_UTILISATION_REPORT._id.toString() },
        'reportPeriod.start.month': { $eq: MOCK_UTILISATION_REPORT.reportPeriod.start.month },
        'reportPeriod.start.year': { $eq: MOCK_UTILISATION_REPORT.reportPeriod.start.year },
      });
      expect(response).toEqual(MOCK_UTILISATION_DATA);
    });
  });
});
