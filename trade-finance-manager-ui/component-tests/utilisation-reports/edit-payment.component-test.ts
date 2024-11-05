import { pageRenderer } from '../pageRenderer';
import { anEditPaymentViewModel } from '../../test-helpers';
import { EditPaymentViewModel } from '../../server/types/view-models';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../server/constants/reconciliation-for-report-tabs';

const page = '../templates/utilisation-reports/edit-payment.njk';
const render = pageRenderer<EditPaymentViewModel>(page);

describe(page, () => {
  it('should add error prefix to page title when there are errors', () => {
    const viewModel: EditPaymentViewModel = {
      ...anEditPaymentViewModel(),
      errors: { errorSummary: [{ text: 'an error', href: 'error-href' }] },
    };
    const wrapper = render(viewModel);

    wrapper.expectDocumentTitle().toRead('Error - Edit payment');
  });

  it('should not add error prefix to page title when there are no errors', () => {
    const viewModel: EditPaymentViewModel = {
      ...anEditPaymentViewModel(),
      errors: { errorSummary: [] },
    };
    const wrapper = render(viewModel);

    wrapper.expectDocumentTitle().toRead('Edit payment');
  });

  it('should render the page heading with the caption', () => {
    const bankName = 'Test bank';
    const formattedReportPeriod = 'January 2024';

    const viewModel: EditPaymentViewModel = {
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
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    viewModel.formValues.paymentAmount = '5 million';
    const wrapper = render(viewModel);

    wrapper.expectInput('input[name="paymentAmount"]').toHaveValue('5 million');
  });

  it('should display error message when there is an error with the amount received', () => {
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    viewModel.errors.paymentAmountErrorMessage = 'That is not a valid amount';
    const wrapper = render(viewModel);

    wrapper.expectText('[id="paymentAmount-error"]').toContain('That is not a valid amount');
  });

  it('should initialise the payment date with the supplied payment date', () => {
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
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
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    viewModel.errors.paymentDateError = { message: 'That is not a valid date', dayError: true, monthError: false, yearError: true };
    const wrapper = render(viewModel);

    wrapper.expectText('[id="paymentDate-error"]').toContain('That is not a valid date');
  });

  it('should add error state to date fields with error', () => {
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    viewModel.errors.paymentDateError = { message: 'That is not a valid date', dayError: true, monthError: false, yearError: true };
    const wrapper = render(viewModel);

    wrapper.expectElement('input[name="paymentDate-day"]').hasClass('govuk-input--error');
    wrapper.expectElement('input[name="paymentDate-month"]').doesNotHaveClass('govuk-input--error');
    wrapper.expectElement('input[name="paymentDate-year"]').hasClass('govuk-input--error');
  });

  it('should initialise the payment reference with the supplied value', () => {
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    viewModel.formValues.paymentReference = 'transaction';
    const wrapper = render(viewModel);

    wrapper.expectInput('input[name="paymentReference"]').toHaveValue('transaction');
  });

  it('should display error message when there is an error with the payment reference', () => {
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    viewModel.errors.paymentReferenceErrorMessage = 'That is far too long';
    const wrapper = render(viewModel);

    wrapper.expectText('[id="paymentReference-error"]').toContain('That is far too long');
  });

  it('should render the delete payment button which links to the confirm delete payment url', () => {
    const viewModel: EditPaymentViewModel = {
      ...anEditPaymentViewModel(),
      reportId: '12',
      paymentId: '34',
      redirectTab: RECONCILIATION_FOR_REPORT_TABS.PREMIUM_PAYMENTS,
    };
    const wrapper = render(viewModel);

    wrapper.expectElement('a[data-cy="delete-payment-button"]').toExist();
    wrapper
      .expectWarningButton('a[data-cy="delete-payment-button"]')
      .toLinkTo('/utilisation-reports/12/edit-payment/34/confirm-delete?redirectTab=premium-payments', 'Delete payment');
  });

  it('should render selection actions within the fee record details table', () => {
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    const wrapper = render(viewModel);

    wrapper.expectElement(`[data-cy="remove-selected-fees-button"]`).toExist();
  });

  it('should render the remove selected fee records error', () => {
    const viewModel: EditPaymentViewModel = anEditPaymentViewModel();
    viewModel.errors.removeSelectedFeesErrorMessage = "No you can't remove that one!";
    const wrapper = render(viewModel);

    wrapper.expectText(`[data-cy="fee-record-details-table"]`).toContain("Error: No you can't remove that one!");
  });

  it.each(Object.values(RECONCILIATION_FOR_REPORT_TABS))(
    'should render the save changes button which linked to the edit payment url with redirectTab query set to %s',
    (redirectTab) => {
      const viewModel: EditPaymentViewModel = {
        ...anEditPaymentViewModel(),
        reportId: '12',
        paymentId: '34',
        redirectTab,
      };
      const wrapper = render(viewModel);

      const saveChangesButtonSelector = 'input[data-cy="save-changes-button"]';
      wrapper.expectInput(saveChangesButtonSelector).toHaveValue('Save changes');
      wrapper.expectElement(saveChangesButtonSelector).toHaveAttribute('formaction', `/utilisation-reports/12/edit-payment/34?redirectTab=${redirectTab}`);
    },
  );

  it('should render the cancel link which links to the same page as the back link', () => {
    const viewModel: EditPaymentViewModel = {
      ...anEditPaymentViewModel(),
      backLinkHref: '/utilisation-reports/123#keying-sheet',
    };
    const wrapper = render(viewModel);

    wrapper.expectLink('a[data-cy="cancel-edit-payment-link"]').toLinkTo('/utilisation-reports/123#keying-sheet', 'Cancel');
  });
});
