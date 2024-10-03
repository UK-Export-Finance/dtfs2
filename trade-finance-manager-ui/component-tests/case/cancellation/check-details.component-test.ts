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

  it('should render the return to deal summary link, linking to case deal page', () => {
    // Arrange
    const dealId = 'dealId';
    const effectiveFromDateViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), dealId };

    // Act
    const wrapper = render(effectiveFromDateViewModel);

    // Assert
    wrapper.expectElement('[data-cy="return-link"]').toExist();
    wrapper.expectLink('[data-cy="return-link"]').toLinkTo(`/case/${dealId}/deal`, 'Return to deal summary');
  });

  it('should render the delete account button', () => {
    // Arrange
    const checkDetailsViewModel: CheckDetailsViewModel = aCheckDetailsViewModel();

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="delete-button"]').toExist();
    wrapper.expectText('[data-cy="delete-button"]').toRead('Delete account');
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
    const checkDetailsViewModel: CheckDetailsViewModel = aCheckDetailsViewModel();

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-response"]').toExist();
    wrapper.expectText('[data-cy="reason-response"]').toRead('-');
  });

  it('should display the reason for cancelling text when it exists', () => {
    // Arrange
    const reason = 'test reason';
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), reason };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="reason-response"]').toExist();
    wrapper.expectText('[data-cy="reason-response"]').toRead(reason);
  });

  it('should display the received bank request date date string', () => {
    // Arrange
    const receivedDateString = '1 January 2024';
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), bankRequestDate: receivedDateString };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="bank-request-date-response"]').toExist();
    wrapper.expectText('[data-cy="bank-request-date-response"]').toRead(receivedDateString);
  });

  it('should display the received effective from date string', () => {
    // Arrange
    const receivedDateString = '1 January 2024';
    const checkDetailsViewModel: CheckDetailsViewModel = { ...aCheckDetailsViewModel(), effectiveFromDate: receivedDateString };

    // Act
    const wrapper = render(checkDetailsViewModel);

    // Assert
    wrapper.expectElement('[data-cy="effective-from-response"]').toExist();
    wrapper.expectText('[data-cy="effective-from-response"]').toRead(receivedDateString);
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
