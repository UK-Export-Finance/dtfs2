const { saveUtilisationData } = require('./utilisation-data-repo');
const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/dbCollections');

describe('utilisation-data-repo', () => {
  it('maps the data and correctly saves to the database', async () => {
    const insertManySpy = jest.fn().mockResolvedValue();
    const getCollectionMock = jest.fn(() => ({
      insertMany: insertManySpy,
    }));
    jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

    const mockReportData = [
      {
        'ukef facility id': '123',
        exporter: 'test exporter',
        'base currency': 'GBP',
        'facility utilisation': '100',
        'total fees accrued for the month': '100',
        'accrual currency': 'USD',
        'accrual exchange rate': '1.23',
        'monthly fees paid to ukef': '100',
        'fees paid to ukef currency': 'GBP',
        'payment currency': 'USD',
        'payment exchange rate': '1.23',
      },
    ];
    const mockMonth = '1';
    const mockYear = '2021';
    const mockBank = {
      id: '123',
    };
    const mockReportId = '123';

    await saveUtilisationData(mockReportData, mockMonth, mockYear, mockBank, mockReportId);

    expect(getCollectionMock).toHaveBeenCalledWith(DB_COLLECTIONS.UTILISATION_DATA);
    expect(insertManySpy).toHaveBeenCalledWith([
      {
        facilityId: '123',
        reportId: '123',
        bankId: '123',
        month: 1,
        year: 2021,
        exporter: 'test exporter',
        baseCurrency: 'GBP',
        facilityUtilisation: 100,
        totalFeesAccruedForTheMonth: 100,
        totalFeesAccruedForTheMonthCurrency: 'USD',
        totalFeesAccruedForTheMonthExchangeRate: 1.23,
        monthlyFeesPaidToUkef: 100,
        monthlyFeesPaidToUkefCurrency: 'GBP',
        paymentCurrency: 'USD',
        paymentExchangeRate: 1.23,
        payments: null,
      },
    ]);
  });
});
