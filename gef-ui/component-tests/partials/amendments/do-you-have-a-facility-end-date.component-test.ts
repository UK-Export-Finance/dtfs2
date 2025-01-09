import { FacilityValueViewModel } from '../../../server/types/view-models/amendments/facility-value-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/do-you-have-a-facility-end-date.njk';
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

  it(`should render the has facility end date input`, () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="is-using-facility-end-date"]').toExist();
    wrapper.expectInput('[data-cy="is-using-facility-end-date-yes"]').toNotBeChecked();
    wrapper.expectInput('[data-cy="is-using-facility-end-date-no"]').toNotBeChecked();
  });

  it(`should render the error summary if an error exists`, () => {
    const errorText = 'an error';

    const paramsWithErrors = {
      ...params,
      errors: {
        errorSummary: [{ text: errorText, href: 'hasFacilityEndDate' }],
        fieldErrors: {
          hasFacilityEndDate: {
            text: errorText,
          },
        },
      },
    };

    const wrapper = render(paramsWithErrors);

    wrapper.expectText('[data-cy="error-summary"]').toContain(errorText);
  });

  it(`should render the hasFacilityEndDate error if an error exists`, () => {
    const errorText = 'an error';

    const paramsWithErrors = {
      ...params,
      errors: {
        errorSummary: [{ text: errorText, href: 'hasFacilityEndDate' }],
        fieldErrors: {
          hasFacilityEndDate: {
            text: errorText,
          },
        },
      },
    };

    const wrapper = render(paramsWithErrors);

    wrapper.expectText('[data-cy="is-using-facility-end-date-error"]').toContain(errorText);
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

  it('should render `What is a facility end date` details', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="what-is-a-facility-end-date"]').toContain('What is a facility end date');
    wrapper
      .expectText('[data-cy="what-is-a-facility-end-date"]')
      .toContain('The facility end date is the deadline for a committed loan to be repaid at which point the contract will be terminated.');
  });

  it('should render `What is a bank review date` details', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="what-is-a-bank-review-date"]').toContain('What is a bank review date');
    wrapper
      .expectText('[data-cy="what-is-a-bank-review-date"]')
      .toContain(
        "The bank review date is when you decide in accordance with your usual policies and procedures for such facilities whether to continue or terminate the facility based on the borrower's needs and circumstances.",
      );
  });
});
