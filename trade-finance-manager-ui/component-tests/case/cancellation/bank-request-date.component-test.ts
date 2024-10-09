import { BankRequestDateViewModel, BankRequestErrorsViewModel } from '../../../server/types/view-models';
import { pageRenderer } from '../../pageRenderer';
import { aBankRequestDateViewModel } from '../../../test-helpers/test-data/view-models';

const page = '../templates/case/cancellation/bank-request-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the continue button', () => {
    // Arrange
    const bankRequestDateViewModel: BankRequestDateViewModel = aBankRequestDateViewModel();

    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render cancel link button linking to case deal page', () => {
    // Arrange
    const dealId = 'dealId';
    const bankRequestDateViewModel: BankRequestDateViewModel = { ...aBankRequestDateViewModel(), dealId };

    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="cancel-link"]').toExist();
    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(`/case/${dealId}/cancellation/cancel`, 'Cancel');
  });

  it('should render back link button linking to the deal cancellation reason page', () => {
    // Arrange
    const dealId = 'dealId';
    const bankRequestDateViewModel: BankRequestDateViewModel = { ...aBankRequestDateViewModel(), dealId };

    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="back-link"]').toExist();
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(`/case/${dealId}/cancellation/reason`, 'Back');
  });

  it('should render date input fields', () => {
    // Arrange
    const bankRequestDateViewModel: BankRequestDateViewModel = aBankRequestDateViewModel();

    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="bank-request-date-day"]').toExist();
    wrapper.expectElement('[data-cy="bank-request-date-month"]').toExist();
    wrapper.expectElement('[data-cy="bank-request-date-year"]').toExist();
  });

  it('should not render error summary when no errors', () => {
    // Arrange
    const bankRequestDateViewModel: BankRequestDateViewModel = aBankRequestDateViewModel();

    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').notToExist();
  });

  it('should not render in line error when there are no errors', () => {
    // Arrange
    const reasonForCancellingViewModel = aBankRequestDateViewModel();

    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="bank-request-date-inline-error"]').notToExist();
  });

  it('should render error summary when there are errors', () => {
    // Arrange
    const errorSummaryText = 'error summary text';

    const errors: BankRequestErrorsViewModel = {
      summary: [{ text: errorSummaryText, href: '#bank-request-date-day' }],
      bankRequestDateError: { message: 'date error message', fields: ['bank-request-date-day'] },
    };

    const bankRequestDateViewModel: BankRequestDateViewModel = { ...aBankRequestDateViewModel(), errors };

    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').toExist();
    wrapper.expectText('[data-cy="error-summary"]').toContain(errorSummaryText);
  });

  it('should render in line error when there are errors', () => {
    // Arrange
    const inlineErrorText = 'inline error text';

    const errors: BankRequestErrorsViewModel = {
      summary: [{ text: 'error summary text', href: '#bank-request-date-day' }],
      bankRequestDateError: { message: inlineErrorText, fields: ['bank-request-date-day'] },
    };

    const bankRequestDateViewModel: BankRequestDateViewModel = { ...aBankRequestDateViewModel(), errors };

    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="bank-request-date-inline-error"]').toExist();
    wrapper.expectText('[data-cy="bank-request-date-inline-error"]').toContain(inlineErrorText);
  });
});
