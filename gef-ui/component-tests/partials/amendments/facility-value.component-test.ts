import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../../server/utils/helpers';
import { FacilityValueViewModel } from '../../../server/types/view-models/amendments/facility-value-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/facility-value.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const facilityValue = '7000';
  const exporterName = 'exporterName';
  const currencySymbol = '£';
  const facilityType = FACILITY_TYPE.CASH;

  const params: FacilityValueViewModel = {
    previousPage,
    cancelUrl,
    facilityValue,
    exporterName,
    currencySymbol,
    facilityType,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toRead('New facility value');
  });

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

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });

  it('should render the currency symbol', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="facility-value-prefix"]').toRead(currencySymbol);
  });

  it('should not render the error summary if there is no error', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="error-summary"]').notToExist();
  });

  it('should not render the in-line error if there is no error', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="facility-value-inline-error"]').notToExist();
  });

  it('should render the error summary if there is an error', () => {
    const errMsg = 'an error';
    const paramsWithError = {
      ...params,
      errors: validationErrorHandler({ errRef: 'facilityValue', errMsg }),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectText('[data-cy="error-summary"]').toContain(errMsg);
  });

  it('should render the inline error if there is an error', () => {
    const errMsg = 'an error';
    const paramsWithError = {
      ...params,
      errors: validationErrorHandler({ errRef: 'facilityValue', errMsg }),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectText('[data-cy="facility-value-inline-error"]').toContain(errMsg);
  });
});
