const { pageRenderer } = require('../pageRenderer');
const { anEditPaymentViewModel } = require('../../test-helpers');

const page = '../templates/utilisation-reports/edit-payment.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the page heading with the caption', () => {
    const bankName = 'Test bank';
    const formattedReportPeriod = 'January 2024';

    const viewModel = {
      ...anEditPaymentViewModel(),
      bank: { id: '123', name: bankName },
      formattedReportPeriod,
    };
    const wrapper = render(viewModel);

    wrapper.expectText('h1[data-cy="edit-payment-heading"]').toRead('Edit payment');
    wrapper.expectText('span[data-cy="edit-payment-heading-caption"]').toMatch(/Test bank,/);
    wrapper.expectText('span[data-cy="edit-payment-heading-caption"]').toMatch(/January 2024/);
  });

  it('should render the fee record table with a caption', () => {
    const wrapper = render(anEditPaymentViewModel());

    wrapper.expectElement('table[data-cy="fee-record-details-table"]').toExist();
    wrapper.expectElement('table[data-cy="fee-record-details-table"] caption:contains("Added reported fees details")').toExist();
  });

  it('should render the remove selected fees button', () => {
    const wrapper = render(anEditPaymentViewModel());

    wrapper.expectElement('input[data-cy="remove-selected-fees-button"]').toExist();
  });

  it('should render the payment details heading', () => {
    const wrapper = render(anEditPaymentViewModel());

    wrapper.expectText('h2.govuk-heading-m').toMatch(/Payment details/);
  });

  it('should display the amount received input with the supplied payment currency', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.paymentCurrency = 'GBP';
    const wrapper = render(viewModel);

    wrapper.expectText('div.govuk-input__prefix').toRead('GBP');
  });

  it('should initialise the amount received with the supplied payment amount', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.formValues.paymentAmount = '5 million';
    const wrapper = render(viewModel);

    wrapper.expectInput('input[name="paymentAmount"]').toHaveValue('5 million');
  });

  it('should display error message when there is an error with the amount received', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.errors.paymentAmountErrorMessage = 'That is not a valid amount';
    const wrapper = render(viewModel);

    wrapper.expectText('[id="paymentAmount-error"]').toContain('That is not a valid amount');
  });

  it('should initialise the payment date with the supplied payment date', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.formValues.paymentDate = {
      day: '12',
      month: '13',
      year: '90000',
    };
    const wrapper = render(viewModel);

    wrapper.expectInput('input[name="paymentDate-day"]').toHaveValue('12');
    wrapper.expectInput('input[name="paymentDate-month"]').toHaveValue('13');
    wrapper.expectInput('input[name="paymentDate-year"]').toHaveValue('90000');
  });

  it('should display error message when there is an error with the payment date', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.errors.paymentDateError = { message: 'That is not a valid date', dayError: true, monthError: false, yearError: true };
    const wrapper = render(viewModel);

    wrapper.expectText('[id="paymentDate-error"]').toContain('That is not a valid date');
  });

  it('should add error state to date fields with error', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.errors.paymentDateError = { message: 'That is not a valid date', dayError: true, monthError: false, yearError: true };
    const wrapper = render(viewModel);

    wrapper.expectElement('input[name="paymentDate-day"]').hasClass('govuk-input--error');
    wrapper.expectElement('input[name="paymentDate-month"]').doesNotHaveClass('govuk-input--error');
    wrapper.expectElement('input[name="paymentDate-year"]').hasClass('govuk-input--error');
  });

  it('should initialise the payment reference with the supplied value', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.formValues.paymentReference = 'transaction';
    const wrapper = render(viewModel);

    wrapper.expectInput('input[name="paymentReference"]').toHaveValue('transaction');
  });

  it('should display error message when there is an error with the payment reference', () => {
    const viewModel = anEditPaymentViewModel();
    viewModel.errors.paymentReferenceErrorMessage = 'That is far too long';
    const wrapper = render(viewModel);

    wrapper.expectText('[id="paymentReference-error"]').toContain('That is far too long');
  });

  it('should render the save changes button which links to the edit payment url', () => {
    const viewModel = {
      ...anEditPaymentViewModel(),
      reportId: '12',
      paymentId: '34',
    };
    const wrapper = render(viewModel);

    const saveChangesButtonSelector = 'input[data-cy="save-changes-button"]';
    wrapper.expectInput(saveChangesButtonSelector).toHaveValue('Save changes');
    wrapper.expectElement(saveChangesButtonSelector).toHaveAttribute('formaction', '/utilisation-reports/12/edit-payment/34');
  });

  it('should render the delete payment button which links to the confirm delete payment url', () => {
    const viewModel = {
      ...anEditPaymentViewModel(),
      reportId: '12',
      paymentId: '34',
    };
    const wrapper = render(viewModel);

    wrapper.expectElement('a[data-cy="delete-payment-button"]').toExist();
    wrapper.expectWarningButton('a[data-cy="delete-payment-button"]').toLinkTo('/utilisation-reports/12/edit-payment/34/confirm-delete', 'Delete payment');
  });

  it('should render the cancel link which links to the premium payments table', () => {
    const viewModel = {
      ...anEditPaymentViewModel(),
      reportId: '12',
    };
    const wrapper = render(viewModel);

    wrapper.expectLink('a[data-cy="cancel-edit-payment-link"]').toLinkTo('/utilisation-reports/12', 'Cancel');
  });
});
