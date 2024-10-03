import { EffectiveFromDateErrorsViewModel, EffectiveFromDateViewModel } from '../../../server/types/view-models';
import { pageRenderer } from '../../pageRenderer';
import { aEffectiveFromDateViewModel } from '../../../test-helpers/test-data/effective-from-date-view-model';

const page = '../templates/case/cancellation/effective-from-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the continue button', () => {
    // Arrange
    const effectiveFromDateViewModel: EffectiveFromDateViewModel = aEffectiveFromDateViewModel();

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render cancel link button linking to case deal page', () => {
    // Arrange
    const dealId = 'dealId';
    const effectiveFromDateViewModel: EffectiveFromDateViewModel = { ...aEffectiveFromDateViewModel(), dealId };

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="cancel-link"]').toExist();
    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(`cancel`, 'Cancel');
  });

  it('should render back link button linking to the deal bank request date page', () => {
    // Arrange
    const dealId = 'dealId';
    const effectiveFromDateViewModel: EffectiveFromDateViewModel = { ...aEffectiveFromDateViewModel(), dealId };

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="back-link"]').toExist();
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(`/case/${dealId}/cancellation/bank-request-date`, 'Back');
  });

  it('should render date input fields', () => {
    // Arrange
    const effectiveFromDateViewModel: EffectiveFromDateViewModel = aEffectiveFromDateViewModel();

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="effective-from-date-day"]').toExist();
    wrapper.expectElement('[data-cy="effective-from-date-month"]').toExist();
    wrapper.expectElement('[data-cy="effective-from-date-year"]').toExist();
  });

  it('should not render error summary when no errors', () => {
    // Arrange
    const effectiveFromDateViewModel: EffectiveFromDateViewModel = aEffectiveFromDateViewModel();

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').notToExist();
  });

  it('should not render in line error when there are no errors', () => {
    // Arrange
    const reasonForCancellingViewModel: EffectiveFromDateViewModel = aEffectiveFromDateViewModel();

    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="effective-from-date-inline-error"]').notToExist();
  });

  it('should render error summary when there are errors', () => {
    // Arrange
    const errorSummaryText = 'error summary text';

    const errors: EffectiveFromDateErrorsViewModel = {
      summary: [{ text: errorSummaryText, href: '#effective-from-date-day' }],
      effectiveFromDateError: { message: 'date error message', fields: ['effective-from-date-day'] },
    };

    const effectiveFromDateViewModel: EffectiveFromDateViewModel = { ...aEffectiveFromDateViewModel(), errors };

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').toExist();
    wrapper.expectText('[data-cy="error-summary"]').toContain(errorSummaryText);
  });

  it('should render in line error when there are errors', () => {
    // Arrange
    const inlineErrorText = 'inline error text';

    const errors: EffectiveFromDateErrorsViewModel = {
      summary: [{ text: 'error summary text', href: '#effective-from-date-day' }],
      effectiveFromDateError: { message: inlineErrorText, fields: ['effective-from-date-day'] },
    };

    const effectiveFromDateViewModel: EffectiveFromDateViewModel = { ...aEffectiveFromDateViewModel(), errors };

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="effective-from-date-inline-error"]').toExist();
    wrapper.expectText('[data-cy="effective-from-date-inline-error"]').toContain(inlineErrorText);
  });
});
