const pageRenderer = require('../pageRenderer');
const { anAddPaymentViewModel } = require('../../test-helpers/test-data/add-payment-view-model');

const page = '../templates/utilisation-reports/add-payment.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the main heading', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.bank.name = 'My bank';
    addPaymentViewModel.formattedReportPeriod = 'December 1998';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('h1').toRead('Add a payment');
    wrapper.expectText('main').toContain('My bank, December 1998');
  });

  it('should display selected fee record details table', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.reportedFeeDetails.totalReportedPayments = 'JPY 1';
    addPaymentViewModel.reportedFeeDetails.feeRecords = [
      {
        feeRecordId: 12,
        facilityId: '000123',
        exporter: 'abcde',
        reportedFee: 'EUR 0.01',
        reportedPayments: 'JPY 3',
      },
    ];
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('[data-cy="selected-reported-fees-details-table"]').toExist();
    wrapper.expectText('[data-cy="selected-reported-fees-details-table"]').toContain('000123');
    wrapper.expectText('[data-cy="selected-reported-fees-details-table"]').toContain('abcde');
    wrapper.expectText('[data-cy="selected-reported-fees-details-table"]').toContain('EUR 0.01');
    wrapper.expectText('[data-cy="selected-reported-fees-details-table"]').toContain('JPY 3');
    wrapper.expectText('[data-cy="selected-reported-fees-details-table"]').toContain('JPY 1');
  });
});
