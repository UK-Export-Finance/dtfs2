import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { AbandonAmendmentViewModel } from '../../../server/types/view-models/amendments/abandon-amendment-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/abandon.njk';
const render = pageRenderer(page);

describe(page, () => {
  const exporterName = 'exporterName';
  const previousPage = 'previousPage';
  const applicationDetailsUrl = 'applicationDetailsUrl';
  const facilityType = FACILITY_TYPE.CASH;

  const params: AbandonAmendmentViewModel = {
    exporterName,
    previousPage,
    facilityType,
    applicationDetailsUrl,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('Confirm that you want to abandon');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it('should render the `Yes, abandon` button', () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="yes-abandon-button"]').toLinkTo(undefined, 'Yes, abandon');
  });

  it('should render the `No, keep` button', () => {
    const wrapper = render(params);

    wrapper.expectSecondaryButton('[data-cy="no-keep-button"]').toLinkTo(applicationDetailsUrl, 'No, keep');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });
});
