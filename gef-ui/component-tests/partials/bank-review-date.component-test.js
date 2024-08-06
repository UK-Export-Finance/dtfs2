const pageRenderer = require('../pageRenderer');

const page = 'partials/bank-review-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const dealId = '61e54dd5b578247e14575882';
  const facilityId = '666862d9140a08222cbd69e7';

  const aBankReviewDateError = (message, refs) => {
    const fieldErrors = {
      bankReviewDate: {
        text: message,
      },
    };

    refs.forEach((ref) => {
      fieldErrors[`bankReviewDate-${ref}`] = {
        text: message,
      };
    });

    return {
      errorSummary: message,
      fieldErrors,
    };
  };

  const params = {
    dealId,
    facilityId,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it(`only renders the 'Back to previous page' link if the status does not equal 'change'`, () => {
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(`/gef/application-details/${dealId}/facilities/${facilityId}/about-facility`, 'Back');

    wrapper = render({
      ...params,
      status: 'change',
    });

    wrapper.expectLink('[data-cy="back-link"]').notToExist();
  });

  it(`only renders the error summary if there are errors`, () => {
    wrapper.expectElement('[data-cy="error-summary"]').notToExist();

    wrapper = render({
      ...params,
      errors: aBankReviewDateError('a validation error', []),
    });

    wrapper.expectElement('[data-cy="error-summary"]').toExist();
  });

  it(`only renders the in-line error message if there are errors`, () => {
    wrapper.expectElement('[data-cy="bank-review-date-inline-error"]').notToExist();

    wrapper = render({
      ...params,
      errors: aBankReviewDateError('a validation error', []),
    });

    wrapper.expectText('[data-cy="bank-review-date-inline-error"]').toRead('Error: a validation error');
  });

  it(`renders the date input without values when undefined`, () => {
    wrapper.expectInput('[data-cy="bank-review-date-day"]').toHaveValue(undefined);
    wrapper.expectInput('[data-cy="bank-review-date-month"]').toHaveValue(undefined);
    wrapper.expectInput('[data-cy="bank-review-date-year"]').toHaveValue(undefined);
  });

  it(`renders the date input with values when given`, () => {
    const bankReviewDate = new Date();
    const bankReviewDateDay = String(bankReviewDate.getDate());
    const bankReviewDateMonth = String(bankReviewDate.getMonth() + 1);
    const bankReviewDateYear = String(bankReviewDate.getFullYear());

    wrapper = render({
      ...params,
      bankReviewDate: {
        day: bankReviewDateDay,
        month: bankReviewDateMonth,
        year: bankReviewDateYear,
      },
    });

    wrapper.expectInput('[data-cy="bank-review-date-day"]').toHaveValue(bankReviewDateDay);
    wrapper.expectInput('[data-cy="bank-review-date-month"]').toHaveValue(bankReviewDateMonth);
    wrapper.expectInput('[data-cy="bank-review-date-year"]').toHaveValue(bankReviewDateYear);
  });

  it(`day input has error class only when date field error given`, () => {
    wrapper.expectElement('[data-cy="bank-review-date-day"]').doesNotHaveClass('govuk-input--error');

    wrapper = render({
      ...params,
      errors: aBankReviewDateError('a validation error', ['day']),
    });

    wrapper.expectElement('[data-cy="bank-review-date-day"]').hasClass('govuk-input--error');
  });

  it(`month input has error class only when date field error given`, () => {
    wrapper.expectElement('[data-cy="bank-review-date-month"]').doesNotHaveClass('govuk-input--error');

    wrapper = render({
      ...params,
      errors: aBankReviewDateError('a validation error', ['month']),
    });

    wrapper.expectElement('[data-cy="bank-review-date-month"]').hasClass('govuk-input--error');
  });

  it(`year input has error class only when date field error given`, () => {
    wrapper.expectElement('[data-cy="bank-review-date-year"]').doesNotHaveClass('govuk-input--error');

    wrapper = render({
      ...params,
      errors: aBankReviewDateError('a validation error', ['year']),
    });

    wrapper.expectElement('[data-cy="bank-review-date-year"]').hasClass('govuk-input--error');
  });

  it('renders the bank review date details', () => {
    wrapper.expectText('[data-cy="bank-review-date-details"] span').toRead('What is a bank review date');
    wrapper
      .expectText('[data-cy="bank-review-date-details"] div')
      .toRead(
        "The bank review date is when you decide in accordance with your usual policies and procedures for such facilities whether to continue or terminate the facility based on the borrower's needs and circumstances.",
      );
  });
});
