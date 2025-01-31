import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { CancelAmendmentViewModel } from '../../../server/types/view-models/amendments/cancel-amendment-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/cancel.njk';
const render = pageRenderer(page);

describe(page, () => {
  const exporterName = 'exporterName';
  const previousPage = 'previousPage';
  const facilityType = FACILITY_TYPE.CASH;

  const params: CancelAmendmentViewModel = {
    exporterName,
    previousPage,
    facilityType,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('Are you sure you want to cancel the request?');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it('should render the `Yes, cancel` button', () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="yes-cancel-button"]').toLinkTo(undefined, 'Yes, cancel');
  });

  it('should render the `No, go back` button', () => {
    const wrapper = render(params);

    wrapper.expectSecondaryButton('[data-cy="no-go-back-button"]').toLinkTo(previousPage, 'No, go back');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });
});
