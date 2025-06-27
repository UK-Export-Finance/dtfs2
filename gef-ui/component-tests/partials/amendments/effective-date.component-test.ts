import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../../server/utils/helpers';
import pageRenderer from '../../pageRenderer';
import { EffectiveDateViewModel } from '../../../server/types/view-models/amendments/effective-date-view-model';

const page = 'partials/amendments/effective-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const effectiveDate = { day: '14', month: '2', year: '2024' };
  const exporterName = 'exporterName';
  const facilityType = FACILITY_TYPE.CASH;
  const canMakerCancelAmendment = true;

  const params: EffectiveDateViewModel = {
    previousPage,
    cancelUrl,
    effectiveDate,
    exporterName,
    facilityType,
    canMakerCancelAmendment,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('Date amendment effective from');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`should render the effective date input`, () => {
    const wrapper = render(params);

    wrapper.expectInput('[data-cy="effective-date-day"]').toHaveValue(effectiveDate.day);
    wrapper.expectInput('[data-cy="effective-date-month"]').toHaveValue(effectiveDate.month);
    wrapper.expectInput('[data-cy="effective-date-year"]').toHaveValue(effectiveDate.year);
  });

  it(`should render the error summary if an error exists`, () => {
    const errMsg = 'an error';

    const paramsWithErrors = {
      ...params,
      errors: validationErrorHandler({ errMsg, errRef: 'effectiveDate' }),
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
      errors: validationErrorHandler({ errMsg, errRef: 'effectiveDate' }),
    };

    const wrapper = render(paramsWithErrors);

    wrapper.expectText('[data-cy="effective-date-inline-error"]').toContain(errMsg);
  });

  it(`should not render the inline error if there is no error`, () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="effective-date-inline-error"]').notToExist();
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
