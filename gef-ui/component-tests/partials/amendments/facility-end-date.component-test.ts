import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../../server/utils/helpers';
import { FacilityEndDateViewModel } from '../../../server/types/view-models/amendments/facility-end-date-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/facility-end-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const facilityEndDate = { day: '14', month: '2', year: '2024' };
  const exporterName = 'exporterName';
  const facilityType = FACILITY_TYPE.CASH;
  const canMakerCancelAmendment = true;

  const params: FacilityEndDateViewModel = {
    previousPage,
    cancelUrl,
    facilityEndDate,
    exporterName,
    facilityType,
    canMakerCancelAmendment,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('Facility end date');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`should render the facility end date input`, () => {
    const wrapper = render(params);

    wrapper.expectInput('[data-cy="facility-end-date-day"]').toHaveValue(facilityEndDate.day);
    wrapper.expectInput('[data-cy="facility-end-date-month"]').toHaveValue(facilityEndDate.month);
    wrapper.expectInput('[data-cy="facility-end-date-year"]').toHaveValue(facilityEndDate.year);
  });

  it(`should render the error summary if an error exists`, () => {
    const errMsg = 'an error';

    const paramsWithErrors = {
      ...params,
      errors: validationErrorHandler({ errMsg, errRef: 'facilityEndDate' }),
    };

    const wrapper = render(paramsWithErrors);

    wrapper.expectText('[data-cy="error-summary"]').toContain(errMsg);
  });

  it(`should not render the error summary if there is no error`, () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="error-summary"]').notToExist();
  });

  it(`should render the inline error if an error exists`, () => {
    const errMsg = 'an error';

    const paramsWithErrors = {
      ...params,
      errors: validationErrorHandler({ errMsg, errRef: 'facilityEndDate' }),
    };

    const wrapper = render(paramsWithErrors);

    wrapper.expectText('[data-cy="facility-end-date-inline-error"]').toContain(errMsg);
  });

  it(`should not render the inline error if there is no error`, () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="facility-end-date-inline-error"]').notToExist();
  });

  it(`should render the continue button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(undefined, 'Continue');
  });

  it(`should render the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(cancelUrl, 'Cancel');
  });

  it('should render the `what is a facility end date` accordion', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="facility-end-date-details"]').toContain('What is a facility end date');
    wrapper
      .expectText('[data-cy="facility-end-date-details"]')
      .toContain('The facility end date is the deadline for a committed loan to be repaid at which point the contract will be terminated.');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });
});
