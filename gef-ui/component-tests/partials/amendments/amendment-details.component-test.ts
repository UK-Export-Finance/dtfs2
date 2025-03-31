import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import pageRenderer from '../../pageRenderer';
import { AmendmentDetailsViewModel } from '../../../server/types/view-models/amendments/amendment-details-view-model';

const page = 'partials/amendments/amendment-details.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const exporterName = 'exporterName';
  const facilityType = FACILITY_TYPE.CASH;

  const params: AmendmentDetailsViewModel = {
    previousPage,
    exporterName,
    facilityType,
    amendmentSummaryListParams: {
      amendmentRows: [],
      eligibilityRows: [],
      effectiveDateRows: [],
    },
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('Amendment details');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });

  it('should render a print button', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="print-button"]').toRead('Print page');
  });

  it('should render amendment summary list', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="amendment-summary-list"]').toExist();
  });

  it('should render eligibility summary list', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="eligibility-summary-list"]').toExist();
  });

  it('should render effective date summary list', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="effective-date-summary-list"]').toExist();
  });
});
