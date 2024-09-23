import { BankRequestDateViewModel, ReasonForCancellingErrorsViewModel } from '../../../server/types/view-models';
import { pageRenderer } from '../../pageRenderer';
import { aBankRequestDateViewModel } from '../../../test-helpers/test-data/bank-request-date-view-model';

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
    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(`/case/${dealId}/deal`, 'Cancel');
  });

  it('should render back link button linking to the case deal page', () => {
    // Arrange
    const dealId = 'dealId';
    const bankRequestDateViewModel: BankRequestDateViewModel = { ...aBankRequestDateViewModel(), dealId };
    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="back-link"]').toExist();
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(`/case/${dealId}/deal`, 'Back');
  });

  it('should not render error summary when no errors', () => {
    // Arrange
    const bankRequestDateViewModel: BankRequestDateViewModel = aBankRequestDateViewModel();
    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').notToExist();
  });

  it('should not render in line error when there are errors', () => {
    // Arrange
    const bankRequestDateViewModel: BankRequestDateViewModel = aBankRequestDateViewModel();
    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="bank-request-date-inline-error"]').notToExist();
  });

  it('should render error summary when there are errors', () => {
    // Arrange
    const errorSummaryText = 'an error';
    const errors: ReasonForCancellingErrorsViewModel = {
      errorSummary: [{ text: errorSummaryText, href: 'bank-request-date' }],
      reasonForCancellingErrorMessage: 'an error occurred',
    };
    const bankRequestDateViewModel: BankRequestDateViewModel = { ...aBankRequestDateViewModel(), errors };
    // Act
    const wrapper = render(bankRequestDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').toExist();
    wrapper.expectText('[data-cy="error-summary"]').toContain(errorSummaryText);
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
});
