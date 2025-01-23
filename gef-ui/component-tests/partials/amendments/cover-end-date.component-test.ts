import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { CoverEndDateViewModel } from '../../../server/types/view-models/amendments/cover-end-date-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/cover-end-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  const coverEndDate = { day: '01', month: '02', year: '2024' };
  const exporterName = 'exporterName';
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const facilityType = FACILITY_TYPE.CASH;

  const params: CoverEndDateViewModel = {
    coverEndDate,
    exporterName,
    previousPage,
    cancelUrl,
    facilityType,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toRead('New cover end date');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`should render the cover end date`, () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="cover-end-date"]').toExist();
  });

  it(`should render the continue button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(undefined, 'Continue');
  });

  it(`should render the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(cancelUrl, 'Cancel');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });
});
