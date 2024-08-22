import { pageRenderer } from '../pageRenderer';
import { anAddToAnExistingPaymentViewModel } from '../../test-helpers/test-data/add-to-an-existing-payment-view-model';
import { AddToAnExistingPaymentViewModel } from '../../server/types/view-models';

const page = '../templates/utilisation-reports/add-to-an-existing-payment.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should display the singular "Add reported fee to an existing payment" heading when only one fee record is selected', () => {
    const addToAnExistingPaymentViewModel = anAddToAnExistingPaymentViewModel();
    addToAnExistingPaymentViewModel.bank.name = 'My bank';
    addToAnExistingPaymentViewModel.formattedReportPeriod = 'December 1998';
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectText('h1').toRead('Add reported fee to an existing payment');
    wrapper.expectText('span[data-cy="add-to-an-existing-payment-heading-caption"]').toMatch(/My bank,/);
    wrapper.expectText('span[data-cy="add-to-an-existing-payment-heading-caption"]').toMatch(/December 1998/);
  });

  it('should display the plural "Add reported fees to an existing payment" heading when multiple fee records are selected', () => {
    const addToAnExistingPaymentViewModel = anAddToAnExistingPaymentViewModel();
    addToAnExistingPaymentViewModel.bank.name = 'My bank';
    addToAnExistingPaymentViewModel.formattedReportPeriod = 'December 1998';
    addToAnExistingPaymentViewModel.reportedFeeDetails = {
      totalReportedPayments: 'GBP 200',
      feeRecords: [
        {
          id: 123,
          facilityId: '12345',
          exporter: 'export',
          reportedFees: { formattedCurrencyAndAmount: 'GBP 200', dataSortValue: 1 },
          reportedPayments: { formattedCurrencyAndAmount: 'GBP 200', dataSortValue: 1 },
        },
        {
          id: 124,
          facilityId: '12345',
          exporter: 'export',
          reportedFees: { formattedCurrencyAndAmount: 'GBP 200', dataSortValue: 1 },
          reportedPayments: { formattedCurrencyAndAmount: 'GBP 200', dataSortValue: 1 },
        },
      ],
    };
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectText('h1').toRead('Add reported fees to an existing payment');
    wrapper.expectText('span[data-cy="add-to-an-existing-payment-heading-caption"]').toMatch(/My bank,/);
    wrapper.expectText('span[data-cy="add-to-an-existing-payment-heading-caption"]').toMatch(/December 1998/);
  });

  it('should display the fee record details table', () => {
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

  it('should render available payment groups', () => {
    // Arrange
    const addToAnExistingPaymentViewModel = anAddToAnExistingPaymentViewModel();
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectElement('div[data-cy="available-payment-groups"]').toExist();
    wrapper.expectElement('[data-cy="payment-group--paymentIds-1,2"]').toExist();
    wrapper.expectElement('[data-cy="payment-group--paymentIds-3"]').toExist();
  });

  it('should render the continue button', () => {
    // Arrange
    const addToAnExistingPaymentViewModel = anAddToAnExistingPaymentViewModel();
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render cancel link button linking to backLinkHref', () => {
    // Arrange
    const backLinkHref = '/utilisation-reports/12?selectedFeeRecordIds=456';
    const addToAnExistingPaymentViewModel: AddToAnExistingPaymentViewModel = {
      ...anAddToAnExistingPaymentViewModel(),
      backLinkHref,
    };
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectElement('[data-cy="cancel-link"]').toExist();
    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(backLinkHref, 'Cancel');
  });

  it('should render back link button linking to backLinkHref', () => {
    // Arrange
    const backLinkHref = '/utilisation-reports/12?selectedFeeRecordIds=456';
    const addToAnExistingPaymentViewModel: AddToAnExistingPaymentViewModel = {
      ...anAddToAnExistingPaymentViewModel(),
      backLinkHref,
    };
    const wrapper = render(addToAnExistingPaymentViewModel);

    // Assert
    wrapper.expectElement('[data-cy="back-link"]').toExist();
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(backLinkHref, 'Back');
  });
});
