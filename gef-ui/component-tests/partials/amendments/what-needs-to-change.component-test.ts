import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../../server/utils/helpers';
import pageRenderer from '../../pageRenderer';
import { WhatNeedsToChangeViewModel } from '../../../server/types/view-models/amendments/what-needs-to-change-view-model.ts';

const page = 'partials/amendments/what-needs-to-change.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const exporterName = 'exporterName';
  const amendmentFormEmail = 'amendmentFormEmail';
  const facilityType = FACILITY_TYPE.CASH;

  const params: WhatNeedsToChangeViewModel = {
    previousPage,
    cancelUrl,
    amendmentFormEmail,
    exporterName,
    facilityType,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toRead('What do you need to change?');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it('should render the amendment selection checkboxes unchecked', () => {
    const wrapper = render(params);

    wrapper.expectInput('[data-cy="cover-end-date-checkbox"]').toNotBeChecked();
    wrapper.expectInput('[data-cy="facility-value-checkbox"]').toNotBeChecked();
  });

  it(`should render the continue button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(undefined, 'Continue');
  });

  it(`should render the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(cancelUrl, 'Cancel');
  });

  it('should render the warning text', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="warning"]').toContain('Check your records for the most up-to-date values');
  });

  it('should not render the error summary if there is no error', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="error-summary"]').notToExist();
  });

  it('should not render the in-line error if there is no error', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="amendment-options-inline-error"]').notToExist();
  });

  it('should render the error summary if there is an error', () => {
    const errMsg = 'an error';
    const paramsWithError = {
      ...params,
      errors: validationErrorHandler({ errRef: 'amendmentOptions', errMsg }),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectText('[data-cy="error-summary"]').toContain(errMsg);
  });

  it('should render the inline error if there is an error', () => {
    const errMsg = 'an error';
    const paramsWithError = {
      ...params,
      errors: validationErrorHandler({ errRef: 'amendmentOptions', errMsg }),
    };

    const wrapper = render(paramsWithError);

    wrapper.expectText('[data-cy="amendment-options-inline-error"]').toContain(errMsg);
  });
});
