import { pageRenderer } from '../pageRenderer';
import { anAddToAnExistingPaymentViewModel } from '../../test-helpers/test-data/add-to-an-existing-payment-view-model';

const page = '../templates/utilisation-reports/add-to-an-existing-payment.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the main heading', () => {
    const addToAnExistingPaymentViewModel = anAddToAnExistingPaymentViewModel();
    addToAnExistingPaymentViewModel.bank.name = 'My bank';
    addToAnExistingPaymentViewModel.formattedReportPeriod = 'December 1998';
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectText('h1').toRead('Add to an existing payment');
    wrapper.expectText('span[data-cy="add-to-an-existing-payment-heading-caption"]').toMatch(/My bank,/);
    wrapper.expectText('span[data-cy="add-to-an-existing-payment-heading-caption"]').toMatch(/December 1998/);
  });

  it('should render the fee record details table', () => {
    // Arrange
    const addToAnExistingPaymentViewModel = anAddToAnExistingPaymentViewModel();
    addToAnExistingPaymentViewModel.reportedFeeDetails.totalReportedPayments = 'JPY 1';
    addToAnExistingPaymentViewModel.reportedFeeDetails.feeRecords = [
      {
        id: 12,
        facilityId: '000123',
        exporter: 'abcde',
        reportedFees: { formattedCurrencyAndAmount: 'EUR 0.01', dataSortValue: 0 },
        reportedPayments: { formattedCurrencyAndAmount: 'JPY 3', dataSortValue: 0 },
      },
    ];
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    const tableSelector = 'table[data-cy="fee-record-details-table"]';
    wrapper.expectElement(tableSelector).toExist();
    wrapper.expectText(tableSelector).toContain('000123');
    wrapper.expectText(tableSelector).toContain('abcde');
    wrapper.expectText(tableSelector).toContain('EUR 0.01');
    wrapper.expectText(tableSelector).toContain('JPY 3');
    wrapper.expectText(tableSelector).toContain('JPY 1');
  });

  it('should render available payment groups radio input', () => {
    // Arrange
    const addToAnExistingPaymentViewModel = anAddToAnExistingPaymentViewModel();
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectElement('div[data-cy="payment-group-radio-input"]').toExist();
    wrapper.expectElement('[data-cy="payment-group--paymentIds-1,2"]').toExist();
    wrapper.expectElement('[data-cy="payment-group--paymentIds-3"]').toExist();
  });
});
