import { FacilityValueViewModel } from '../../../server/types/view-models/amendments/facility-value-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/facility-value.njk';
const render = pageRenderer(page);

describe(page, () => {
  const dealId = 'dealId';
  const facilityId = 'facilityId';
  const amendmentId = 'amendmentId';
  const previousPage = 'previousPage';
  const facilityValue = 7000;
  const exporterName = 'exporterName';

  const params: FacilityValueViewModel = {
    dealId,
    facilityId,
    amendmentId,
    previousPage,
    facilityValue,
    exporterName,
  };

  it(`renders the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`renders the facility value input`, () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="facility-value"]').toExist();
  });

  it(`renders the continue button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(undefined, 'Continue');
  });

  it(`renders the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(`/case/${dealId}/facilities/${facilityId}/amendment/${amendmentId}/cancel`, 'Cancel');
  });

  it('renders the exporter name in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(exporterName);
  });
});
