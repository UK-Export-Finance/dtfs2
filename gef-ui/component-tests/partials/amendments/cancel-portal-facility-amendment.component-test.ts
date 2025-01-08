import { CancelAmendmentViewModel } from '../../../server/types/view-models/amendments/cancel-amendment-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/cancel.njk';
const render = pageRenderer(page);

describe(page, () => {
  const exporterName = 'exporterName';
  const previousPage = 'previousPage';
  const cancelAmendmentUrl = 'cancelAmendmentUrl';

  const params: CancelAmendmentViewModel = {
    exporterName,
    cancelAmendmentUrl,
    previousPage,
  };

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it('should render the `Yes, cancel` button', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="yes-cancel-button"]').toExist();
    wrapper.expectText('[data-cy="yes-cancel-button"]').toRead('Yes, cancel');
    wrapper.expectPrimaryButton('[data-cy="yes-cancel-button"]').toLinkTo(undefined, 'Yes, cancel');
  });

  it('should render the `No, go back` button', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="no-go-back-button"]').toExist();
    wrapper.expectText('[data-cy="no-go-back-button"]').toRead('No, go back');
  });

  it('should render the exporter name in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(exporterName);
  });
});
