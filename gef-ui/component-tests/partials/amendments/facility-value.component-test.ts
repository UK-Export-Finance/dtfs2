import { FacilityValueViewModel } from '../../../server/types/view-models/amendments/facility-value-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/facility-value.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const facilityValue = 7000;
  const exporterName = 'exporterName';
  const currencySymbol = '£';

  const params: FacilityValueViewModel = {
    previousPage,
    cancelUrl,
    facilityValue,
    exporterName,
    currencySymbol,
  };

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`should render the facility value input`, () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="facility-value"]').toExist();
  });

  it(`should render the continue button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(undefined, 'Continue');
  });

  it(`should render the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(cancelUrl, 'Cancel');
  });

  it('should render the exporter name in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(exporterName);
  });

  it('should render the currency symbol', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="facility-value-prefix"]').toRead(currencySymbol);
  });
});
