import { CancelCancellationViewModel } from '../../../server/types/view-models';
import { aCancelCancellationViewModel } from '../../../test-helpers/test-data/view-models';
import { pageRenderer } from '../../pageRenderer';

const page = '../templates/case/cancellation/cancel.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the `Yes, cancel` button', () => {
    // Arrange
    const reasonForCancellingViewModel = aCancelCancellationViewModel();
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="yes-cancel-button"]').toExist();
    wrapper.expectText('[data-cy="yes-cancel-button"]').toRead('Yes, cancel');
  });

  it('should render the `No, go back` button', () => {
    // Arrange
    const reasonForCancellingViewModel = aCancelCancellationViewModel();
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="no-go-back-button"]').toExist();
    wrapper.expectText('[data-cy="no-go-back-button"]').toRead('No, go back');
  });

  it('should render back link button linking to the previous page', () => {
    // Arrange
    const previousPage = 'previousPage';
    const reasonForCancellingViewModel: CancelCancellationViewModel = { ...aCancelCancellationViewModel(), previousPage };
    // Act
    const wrapper = render(reasonForCancellingViewModel);

    // Assert
    wrapper.expectElement('[data-cy="back-link"]').toExist();
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });
});
