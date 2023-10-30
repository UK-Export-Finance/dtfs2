const { saveUtilisationData } = require('./utilisation-data-repo');
const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

describe('utilisation-data-repo', () => {
  it('returns null when a correct month is provided', async () => {
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
        'monthly fees paid to ukef': '100',
        'payment currency': 'GBP',
        'exchange rate': '1',
      },
    ];
    const mockMonth = 1;
    const mockYear = 2021;
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
        facility_utilisation: '100',
        total_fees_accrued_for_the_month: '100',
        monthly_fees_paid_to_ukef: '100',
        payment_currency: 'GBP',
        exchange_rate: '1',
        payments: null,
      },
    ]);
  });
});
