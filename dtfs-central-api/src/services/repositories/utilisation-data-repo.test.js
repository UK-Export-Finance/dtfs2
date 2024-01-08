const { saveUtilisationData, getAllUtilisationDataForReport } = require('./utilisation-data-repo');
const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/db-collections');
const { MOCK_UTILISATION_DATA } = require('../../../api-tests/mocks/utilisation-data');
const { MOCK_UTILISATION_REPORT } = require('../../../api-tests/mocks/utilisation-reports');

describe('utilisation-data-repo', () => {
  describe('saveUtilisationData', () => {
    it('maps the data and correctly saves to the database', async () => {
      // Arrange
      const insertManySpy = jest.fn();
      const getCollectionMock = jest.fn(() => ({
        insertMany: insertManySpy,
      }));
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const mockReportData = {
        'ukef facility id': '123',
        exporter: 'test exporter',
        'base currency': 'GBP',
        'facility utilisation': '300',
        'total fees accrued for the month': '200',
        'accrual currency': 'USD',
        'accrual exchange rate': '1.23',
        'fees paid to ukef for the period': '100',
        'fees paid to ukef currency': 'GBP',
        'payment currency': 'USD',
        'payment exchange rate': '1.23',
      };
      const mockMonth = 1;
      const mockYear = 2021;
      const mockBank = {
        id: '456',
      };
      const mockReportId = '789';

      // Act
      await saveUtilisationData([mockReportData], mockMonth, mockYear, mockBank, mockReportId);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_DATA);
      expect(insertManySpy).toHaveBeenCalledWith([
        {
          facilityId: mockReportData['ukef facility id'],
          reportId: mockReportId,
          bankId: mockBank.id,
          month: mockMonth,
          year: mockYear,
          exporter: mockReportData.exporter,
          baseCurrency: mockReportData['base currency'],
          facilityUtilisation: Number(mockReportData['facility utilisation']),
          totalFeesAccruedForTheMonth: Number(mockReportData['total fees accrued for the month']),
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
      const getCollectionMock = jest.fn(() => ({
        find: findMock,
      }));
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      // Act
      const response = await getAllUtilisationDataForReport(MOCK_UTILISATION_REPORT);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_DATA);
      expect(findMock).toHaveBeenCalledWith({
        reportId: MOCK_UTILISATION_REPORT._id.toString(),
        month: MOCK_UTILISATION_REPORT.month,
        year: MOCK_UTILISATION_REPORT.year,
      });
      expect(response).toEqual(MOCK_UTILISATION_DATA);
    });
  });
});
