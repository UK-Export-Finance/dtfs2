const { pageRenderer } = require('../pageRenderer');
const { anAddPaymentViewModel, aRecordedPaymentDetailsViewModel } = require('../../test-helpers/test-data/view-models');

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
    wrapper.expectText('span[data-cy="add-payment-heading-caption"]').toMatch(/My bank,/);
    wrapper.expectText('span[data-cy="add-payment-heading-caption"]').toMatch(/December 1998/);
  });

  it('should display the recorded payments accordion when there are previously recorded payments', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.recordedPaymentsDetails = [
      {
        formattedDateReceived: '23 Dec 2024',
        formattedCurrencyAndAmount: 'GBP 300',
        reference: 'REF1234',
      },
    ];
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('main').toContain('Recorded payments');
    wrapper.expectText('[data-cy="recorded-payments-details-table"]').toContain('Date received');
    wrapper.expectText('[data-cy="recorded-payments-details-table"]').toContain('Amount received');
    wrapper.expectText('[data-cy="recorded-payments-details-table"]').toContain('Payment reference');
    wrapper.expectText('[data-cy="recorded-payments-details-table"]').toContain('23 Dec 2024');
    wrapper.expectText('[data-cy="recorded-payments-details-table"]').toContain('GBP 300');
    wrapper.expectText('[data-cy="recorded-payments-details-table"]').toContain('REF1234');
  });

  it('should not display the recorded payments accordion when there are no previously recorded payments', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.recordedPaymentsDetails = [];
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('main').notToContain('Recorded payments');
  });

  it('should display the recorded payments accordion title as "Recorded payments for this fee" when "multipleFeeRecordsSelected" is false', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.multipleFeeRecordsSelected = false;
    addPaymentViewModel.recordedPaymentsDetails = [aRecordedPaymentDetailsViewModel()];
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('main').toContain('Recorded payments for this fee');
  });

  it('should display the recorded payments accordion title as "Recorded payments for these fees" when "multipleFeeRecordsSelected" is true', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.multipleFeeRecordsSelected = true;
    addPaymentViewModel.recordedPaymentsDetails = [aRecordedPaymentDetailsViewModel()];
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('main').toContain('Recorded payments for these fees');
  });

  it('should display fee record details table', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.reportedFeeDetails.totalReportedPayments = 'JPY 1';
    addPaymentViewModel.reportedFeeDetails.feeRecords = [
      {
        feeRecordId: 12,
        facilityId: '000123',
        exporter: 'abcde',
        reportedFees: { formattedCurrencyAndAmount: 'EUR 0.01', dataSortValue: 0 },
        reportedPayments: { formattedCurrencyAndAmount: 'JPY 3', dataSortValue: 0 },
      },
    ];
    const wrapper = render(addPaymentViewModel);

    // Assert
    const tableSelector = 'table[data-cy="fee-record-details-table"]';
    wrapper.expectElement(tableSelector).toExist();
    wrapper.expectText(tableSelector).toContain('000123');
    wrapper.expectText(tableSelector).toContain('abcde');
    wrapper.expectText(tableSelector).toContain('EUR 0.01');
    wrapper.expectText(tableSelector).toContain('JPY 3');
    wrapper.expectText(tableSelector).toContain('JPY 1');
  });

  it('should not display inset text explaining tolerances if gbpTolerance is 0', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.gbpTolerance = 0;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('[data-cy="inset-tolerance-text"]').notToExist();
  });

  it('should display inset text explaining tolerances if gbpTolerance is greater than 0', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.gbpTolerance = 1.45;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('[data-cy="inset-tolerance-text"]').toExist();
    wrapper
      .expectText('[data-cy="inset-tolerance-text"]')
      .toRead(
        `Tolerances of £${addPaymentViewModel.gbpTolerance} or equivalent are applied. You cannot add any additional payments to the record if it is taken to a match status as a result of tolerance.`,
      );
  });

  it('should display a currency option for each currency', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('input[type="radio"][value="GBP"]').toExist();
    wrapper.expectElement('label:contains("GBP")').toExist();
    wrapper.expectElement('input[type="radio"][value="JPY"]').toExist();
    wrapper.expectElement('label:contains("JPY")').toExist();
    wrapper.expectElement('input[type="radio"][value="USD"]').toExist();
    wrapper.expectElement('label:contains("USD")').toExist();
    wrapper.expectElement('input[type="radio"][value="EUR"]').toExist();
    wrapper.expectElement('label:contains("EUR")').toExist();
  });

  it('should not initialise payment currency when no value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentCurrency = undefined;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[type="radio"][value="GBP"]').notToBeChecked();
    wrapper.expectInput('input[type="radio"][value="JPY"]').notToBeChecked();
    wrapper.expectInput('input[type="radio"][value="EUR"]').notToBeChecked();
    wrapper.expectInput('input[type="radio"][value="USD"]').notToBeChecked();
  });

  it('should initialise payment currency when value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentCurrency = 'USD';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[type="radio"][value="USD"]').toBeChecked();
  });

  it('should display error message when there is an error with the payment currency', () => {
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.errors.paymentCurrencyErrorMessage = 'Please, select a currency';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('[id="paymentCurrency-error"]').toContain('Please, select a currency');
  });

  it('should not initialise amount received when no value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentAmount = undefined;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[name="paymentAmount"]').toHaveValue(undefined);
  });

  it('should initialise amount received when value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentAmount = '5 million';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[name="paymentAmount"]').toHaveValue('5 million');
  });

  it('should display error message when there is an error with the amount received', () => {
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.errors.paymentAmountErrorMessage = 'That is not a valid amount';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('[id="paymentAmount-error"]').toContain('That is not a valid amount');
  });

  it('should not initialise payment date when no value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentDate = {};
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[name="paymentDate-day"]').toHaveValue(undefined);
    wrapper.expectInput('input[name="paymentDate-month"]').toHaveValue(undefined);
    wrapper.expectInput('input[name="paymentDate-year"]').toHaveValue(undefined);
  });

  it('should initialise payment date when value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentDate = {
      day: '12',
      month: '13',
      year: '90000',
    };
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[name="paymentDate-day"]').toHaveValue('12');
    wrapper.expectInput('input[name="paymentDate-month"]').toHaveValue('13');
    wrapper.expectInput('input[name="paymentDate-year"]').toHaveValue('90000');
  });

  it('should display error message when there is an error with the payment date', () => {
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.errors.paymentDateError = { message: 'That is not a valid date', dayError: true, monthError: false, yearError: true };
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('[id="paymentDate-error"]').toContain('That is not a valid date');
  });

  it('should add error state to date fields with error', () => {
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.errors.paymentDateError = { message: 'That is not a valid date', dayError: true, monthError: false, yearError: true };
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('input[name="paymentDate-day"]').hasClass('govuk-input--error');
    wrapper.expectElement('input[name="paymentDate-month"]').doesNotHaveClass('govuk-input--error');
    wrapper.expectElement('input[name="paymentDate-year"]').hasClass('govuk-input--error');
  });

  it('should not initialise payment reference when no value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentReference = undefined;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[name="paymentReference"]').toHaveValue(undefined);
  });

  it('should initialise payment reference when value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.paymentReference = 'transaction';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[name="paymentReference"]').toHaveValue('transaction');
  });

  it('should display error message when there is an error with the payment reference', () => {
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.errors.paymentReferenceErrorMessage = 'That is far too long';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('[id="paymentReference-error"]').toContain('That is far too long');
  });

  it('should not initialise add another payment choice when no value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.addAnotherPayment = undefined;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[type="radio"][value="true"]').notToBeChecked();
    wrapper.expectInput('input[type="radio"][value="false"]').notToBeChecked();
  });

  it('should initialise add another payment choice when value given', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.formValues.addAnotherPayment = 'true';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectInput('input[type="radio"][value="true"]').toBeChecked();
  });

  it('should display error message when there is an error with the add another payment choice', () => {
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.errors.addAnotherPaymentErrorMessage = 'Please, tell us if you have more';
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectText('[id="addAnotherPayment-error"]').toContain('Please, tell us if you have more');
  });

  it('cancel link should link to backLinkHref', () => {
    // Arrange
    const backLinkHref = 'back-link-url';
    const addPaymentViewModel = {
      ...anAddPaymentViewModel(),
      backLinkHref,
    };

    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectLink('a:contains("Cancel")').toLinkTo(backLinkHref, 'Cancel');
  });

  it('back link should link to backLinkHref', () => {
    // Arrange
    const backLinkHref = 'back-link-url';
    const addPaymentViewModel = {
      ...anAddPaymentViewModel(),
      backLinkHref,
    };

    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectLink('a:contains("Back")').toLinkTo(backLinkHref, 'Back');
  });

  it('should display form heading as "New payment details" when payment number is 1', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.paymentNumber = 1;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('h2:contains("New payment details")').toExist();
  });

  it('should display number of the payment in the form heading when payment number is greater than 1', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.paymentNumber = 2;
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('h2:contains("Payment 2 details")').toExist();
  });

  it('should set hidden inputs for each selected checkbox id', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.selectedFeeRecordCheckboxIds = ['fee-record-5', 'fee-record-20'];
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement('input[name="fee-record-5"]').toExist();
    wrapper.expectElement('input[name="fee-record-20"]').toExist();
  });

  it('should display error summary', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.errors.errorSummary = [{ text: 'Uh oh', href: '#uh-oh' }];
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectLink('a:contains("Uh oh")').toLinkTo('#uh-oh', 'Uh oh');
  });

  it('should not render selection actions within the fee record details table', () => {
    const addPaymentViewModel = anAddPaymentViewModel();
    const wrapper = render(addPaymentViewModel);

    wrapper.expectElement(`[data-cy="remove-selected-fees-button"]`).notToExist();
  });

  it('should display singular "Add reported fee to an existing payment" button when canAddToExistingPayment is true and only one payment exists', () => {
    // Arrange
    const addPaymentViewModel = {
      ...anAddPaymentViewModel(),
      canAddToExistingPayment: true,
      reportId: 123,
    };
    const wrapper = render(addPaymentViewModel);

    // Assert
    const addFeesToExistingPaymentButtonSelector = '[data-cy="add-fees-to-an-existing-payment-button"]';
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).toExist();
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).toHaveAttribute('value', 'Add reported fee to an existing payment');
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).hasClass('govuk-button--secondary');
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).toHaveAttribute('formaction', `/utilisation-reports/123/add-to-an-existing-payment`);
  });

  it('should display plural "Add reported fees to an existing payment" button when canAddToExistingPayment is true and multiple payments exist', () => {
    // Arrange
    const addPaymentViewModel = anAddPaymentViewModel();
    addPaymentViewModel.reportId = 123;
    addPaymentViewModel.canAddToExistingPayment = true;
    addPaymentViewModel.reportedFeeDetails.feeRecords = [
      {
        feeRecordId: 7,
        facilityId: '000123',
        exporter: 'abcde',
        reportedFees: { formattedCurrencyAndAmount: 'EUR 0.01', dataSortValue: 0 },
        reportedPayments: { formattedCurrencyAndAmount: 'GBP 7', dataSortValue: 0 },
      },
      {
        feeRecordId: 8,
        facilityId: '000123',
        exporter: 'abcdef',
        reportedFees: { formattedCurrencyAndAmount: 'EUR 0.01', dataSortValue: 0 },
        reportedPayments: { formattedCurrencyAndAmount: 'GBP 8', dataSortValue: 0 },
      },
    ];
    const wrapper = render(addPaymentViewModel);

    // Assert
    const addFeesToExistingPaymentButtonSelector = '[data-cy="add-fees-to-an-existing-payment-button"]';
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).toExist();
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).toHaveAttribute('value', 'Add reported fees to an existing payment');
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).hasClass('govuk-button--secondary');
    wrapper.expectElement(addFeesToExistingPaymentButtonSelector).toHaveAttribute('formaction', `/utilisation-reports/123/add-to-an-existing-payment`);
  });

  it('should not display "Add reported fee to an existing payment" button when canAddToExistingPayment is false', () => {
    // Arrange
    const addPaymentViewModel = {
      ...anAddPaymentViewModel(),
      canAddToExistingPayment: false,
    };
    const wrapper = render(addPaymentViewModel);

    // Assert
    wrapper.expectElement(`[data-cy="add-fees-to-an-existing-payment-button"]`).notToExist();
  });
});
