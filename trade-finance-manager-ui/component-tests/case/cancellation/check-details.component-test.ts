import { CheckDetailsViewModel } from '../../../server/types/view-models';
import { pageRenderer } from '../../pageRenderer';
import { aCheckDetailsViewModel } from '../../../test-helpers/test-data/check-answers-view-model';

const page = '../templates/case/cancellation/check-details.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render back link button linking to the effective from date page', () => {
    // Arrange
    const dealId = 'dealId';
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), dealId };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="back-link"]').toExist();
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(`/case/${dealId}/cancellation/effective-from-date`, 'Back');
  });

  it('should render the return to deal summary link, linking to the cancel page', () => {
    // Arrange
    const dealId = 'dealId';
    const effectiveFromDateViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), dealId };

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="return-link"]').toExist();
    wrapper.expectLink('[data-cy="return-link"]').toLinkTo(`/case/${dealId}/cancellation/cancel`, 'Return to deal summary');
  });

  it('should render the cancel deal button', () => {
    // Arrange
    const checkDetailsViewModel: CheckDetailsViewModel = aCheckDetailsViewModel();

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="delete-button"]').toExist();
    wrapper.expectText('[data-cy="delete-button"]').toRead('Cancel deal');
  });

  it('should display a warning message about cancelling the deal', () => {
    // Arrange
    const checkDetailsViewModel: CheckDetailsViewModel = aCheckDetailsViewModel();

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="warning"]').toExist();
    wrapper.expectText('[data-cy="warning"]').toContain('When you cancel the deal it cannot be undone');
  });

  it('should render all the headings of each row', () => {
    // Arrange
    const checkDetailsViewModel: CheckDetailsViewModel = aCheckDetailsViewModel();

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-heading"]').toExist();
    wrapper.expectElement('[data-cy="bank-request-date-heading"]').toExist();
    wrapper.expectElement('[data-cy="effective-from-heading"]').toExist();
  });

  it('should display a dash when the reason for cancelling a deal is empty', () => {
    // Arrange
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), cancellation: {} };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-response"]').toExist();
    wrapper.expectText('[data-cy="reason-response"]').toRead('-');
  });

  it('should display the reason for cancelling text when it exists', () => {
    // Arrange
    const reason = 'test reason';
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), cancellation: { reason } };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-response"]').toExist();
    wrapper.expectText('[data-cy="reason-response"]').toRead(reason);
  });

  it('should display the received bank request date date string', () => {
    // Arrange
    const bankRequestDate = 1729007392441;
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), cancellation: { bankRequestDate } };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    const expectedBankRequestDateString = '15 October 2024';
    wrapper.expectElement('[data-cy="bank-request-date-response"]').toExist();
    wrapper.expectText('[data-cy="bank-request-date-response"]').toRead(expectedBankRequestDateString);
  });

  it('should display the received effective from date string', () => {
    // Arrange
    const effectiveFrom = 1729007392441;
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), cancellation: { effectiveFrom } };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    const expectedEffectiveFromString = '15 October 2024';
    wrapper.expectElement('[data-cy="effective-from-response"]').toExist();
    wrapper.expectText('[data-cy="effective-from-response"]').toRead(expectedEffectiveFromString);
  });

  it('should render the Change links', () => {
    // Arrange
    const dealId = 'dealId';
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), dealId };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-link"]').toExist();
    wrapper.expectElement('[data-cy="bank-request-date-link"]').toExist();
    wrapper.expectElement('[data-cy="effective-from-link"]').toExist();
  });
});
