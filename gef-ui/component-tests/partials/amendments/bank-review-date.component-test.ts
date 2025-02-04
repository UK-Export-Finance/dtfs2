import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { validationErrorHandler } from '../../../server/utils/helpers';
import { BankReviewDateViewModel } from '../../../server/types/view-models/amendments/bank-review-date-view-model';
import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/bank-review-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  const previousPage = 'previousPage';
  const cancelUrl = 'cancelUrl';
  const bankReviewDate = { day: '14', month: '2', year: '2024' };
  const exporterName = 'exporterName';
  const facilityType = FACILITY_TYPE.CASH;

  const params: BankReviewDateViewModel = {
    previousPage,
    cancelUrl,
    bankReviewDate,
    exporterName,
    facilityType,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('Bank review date');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`should render the bank review date input`, () => {
    const wrapper = render(params);

    wrapper.expectInput('[data-cy="bank-review-date-day"]').toHaveValue(bankReviewDate.day);
    wrapper.expectInput('[data-cy="bank-review-date-month"]').toHaveValue(bankReviewDate.month);
    wrapper.expectInput('[data-cy="bank-review-date-year"]').toHaveValue(bankReviewDate.year);
  });

  it(`should render the error summary if an error exists`, () => {
    const errMsg = 'an error';

    const paramsWithErrors = {
      ...params,
      errors: validationErrorHandler({ errMsg, errRef: 'bankReviewDate' }),
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
      errors: validationErrorHandler({ errMsg, errRef: 'bankReviewDate' }),
    };

    const wrapper = render(paramsWithErrors);

    wrapper.expectText('[data-cy="bank-review-date-inline-error"]').toContain(errMsg);
  });

  it(`should not render the inline error if there is no error`, () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="bank-review-date-inline-error"]').notToExist();
  });

  it(`should render the continue button`, () => {
    const wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="continue-button"]').toLinkTo(undefined, 'Continue');
  });

  it(`should render the cancel link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(cancelUrl, 'Cancel');
  });

  it('should render the `what is a bank review date` accordion', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="bank-review-date-details"]').toContain('What is a bank review date');
    wrapper
      .expectText('[data-cy="bank-review-date-details"]')
      .toContain(
        "The bank review date is when you decide in accordance with your usual policies and procedures for such facilities whether to continue or terminate the facility based on the borrower's needs and circumstances.",
      );
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });
});
