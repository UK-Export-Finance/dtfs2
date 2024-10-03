import { ReasonForCancellingErrorsViewModel, ReasonForCancellingViewModel } from '../../../server/types/view-models';
import { aReasonForCancellingViewModel } from '../../../test-helpers/test-data/reason-for-cancelling-view-model';
import { pageRenderer } from '../../pageRenderer';

const page = '../templates/case/cancellation/reason-for-cancelling.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the continue button', () => {
    // Arrange
    const reasonForCancellingViewModel = aReasonForCancellingViewModel();
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render cancel link button linking to case deal page', () => {
    // Arrange
    const dealId = 'dealId';
    const reasonForCancellingViewModel: ReasonForCancellingViewModel = { ...aReasonForCancellingViewModel(), dealId };
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="cancel-link"]').toExist();
    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(`cancel`, 'Cancel');
  });

  it('should render back link button linking to the case deal page', () => {
    // Arrange
    const dealId = 'dealId';
    const reasonForCancellingViewModel: ReasonForCancellingViewModel = { ...aReasonForCancellingViewModel(), dealId };
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="back-link"]').toExist();
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(`/case/${dealId}/deal`, 'Back');
  });

  it('should not render error summary when no errors', () => {
    // Arrange
    const reasonForCancellingViewModel = aReasonForCancellingViewModel();
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').notToExist();
  });

  it('should not render in line error when there are no errors', () => {
    // Arrange
    const reasonForCancellingViewModel = aReasonForCancellingViewModel();
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-for-cancelling-inline-error"]').notToExist();
  });

  it('should render error summary when there are errors', () => {
    // Arrange
    const errorSummaryText = 'an error';
    const errors: ReasonForCancellingErrorsViewModel = {
      errorSummary: [{ text: errorSummaryText, href: 'reason-for-cancelling' }],
      reasonForCancellingErrorMessage: 'an error occurred',
    };
    const reasonForCancellingViewModel: ReasonForCancellingViewModel = { ...aReasonForCancellingViewModel(), errors };
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="error-summary"]').toExist();
    wrapper.expectText('[data-cy="error-summary"]').toContain(errorSummaryText);
  });

  it('should render in line error when there are errors', () => {
    // Arrange
    const reasonForCancellingErrorMessage = 'an error occurred';
    const errors: ReasonForCancellingErrorsViewModel = {
      errorSummary: [{ text: 'an error', href: 'reason-for-cancelling' }],
      reasonForCancellingErrorMessage: 'an error occurred',
    };
    const reasonForCancellingViewModel: ReasonForCancellingViewModel = { ...aReasonForCancellingViewModel(), errors };
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-for-cancelling-inline-error"]').toExist();
    wrapper.expectText('[data-cy="reason-for-cancelling-inline-error"]').toContain(reasonForCancellingErrorMessage);
  });

  it('should render reason for cancelling text box', () => {
    // Arrange
    const reasonForCancellingViewModel = aReasonForCancellingViewModel();
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-for-cancelling-text-box"]').toExist();
  });
});
