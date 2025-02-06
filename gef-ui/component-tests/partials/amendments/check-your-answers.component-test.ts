import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import pageRenderer from '../../pageRenderer';
import { CheckYourAnswersViewModel } from '../../../server/types/view-models/amendments/check-your-answers-view-model';

const page = 'partials/amendments/check-your-answers.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const exporterName = 'exporterName';
  const facilityType = FACILITY_TYPE.CASH;

  const params: CheckYourAnswersViewModel = {
    previousPage,
    cancelUrl,
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

    wrapper.expectText('[data-cy="page-heading"]').toContain('Check your answers before submitting the amendment request');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`should render the submit button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="submit-button"]').toLinkTo(undefined, 'Submit to be checked at your bank');
  });

  it(`should render the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(cancelUrl, 'Cancel');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });

  it('should render amendment summary list', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="amendments-summary-list"]').toExist();
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
