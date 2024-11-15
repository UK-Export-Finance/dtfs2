const pageRenderer = require('../pageRenderer');

const page = '_partials/facility-end-date.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const dealId = '61e54dd5b578247e14575882';
  const facilityId = '666862d9140a08222cbd69e7';
  const previousPage = 'gef/previous-page';

  const aFacilityEndDateError = (message, refs) => {
    const fieldErrors = {
      facilityEndDate: {
        text: message,
      },
    };

    refs.forEach((ref) => {
      fieldErrors[`facilityEndDate-${ref}`] = {
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
    previousPage,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it(`does not render the 'Back to previous page' link when the status is 'change'`, () => {
    wrapper = render({
      ...params,
      status: 'change',
    });

    wrapper.expectLink('[data-cy="back-link"]').notToExist();
  });

  it(`renders the 'Back to previous page' link if the status is not 'change'`, () => {
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it(`only renders the error summary if there are errors`, () => {
    wrapper.expectElement('[data-cy="error-summary"]').notToExist();

    wrapper = render({
      ...params,
      errors: aFacilityEndDateError('a validation error', []),
    });

    wrapper.expectElement('[data-cy="error-summary"]').toExist();
  });

  it(`only renders the in-line error message if there are errors`, () => {
    wrapper.expectElement('[data-cy="facility-end-date-inline-error"]').notToExist();

    wrapper = render({
      ...params,
      errors: aFacilityEndDateError('a validation error', []),
    });

    wrapper.expectText('[data-cy="facility-end-date-inline-error"]').toRead('Error: a validation error');
  });

  it(`renders the date input without values when a date is not provided`, () => {
    wrapper.expectInput('[data-cy="facility-end-date-day"]').toHaveValue(undefined);
    wrapper.expectInput('[data-cy="facility-end-date-month"]').toHaveValue(undefined);
    wrapper.expectInput('[data-cy="facility-end-date-year"]').toHaveValue(undefined);
  });

  it(`renders the date input with values when a date is provided`, () => {
    const facilityEndDate = new Date();
    const facilityEndDateDay = String(facilityEndDate.getDate());
    const facilityEndDateMonth = String(facilityEndDate.getMonth() + 1);
    const facilityEndDateYear = String(facilityEndDate.getFullYear());

    wrapper = render({
      ...params,
      facilityEndDate: {
        day: facilityEndDateDay,
        month: facilityEndDateMonth,
        year: facilityEndDateYear,
      },
    });

    wrapper.expectInput('[data-cy="facility-end-date-day"]').toHaveValue(facilityEndDateDay);
    wrapper.expectInput('[data-cy="facility-end-date-month"]').toHaveValue(facilityEndDateMonth);
    wrapper.expectInput('[data-cy="facility-end-date-year"]').toHaveValue(facilityEndDateYear);
  });

  it(`day input has error class only when date field error given`, () => {
    wrapper.expectElement('[data-cy="facility-end-date-day"]').doesNotHaveClass('govuk-input--error');

    wrapper = render({
      ...params,
      errors: aFacilityEndDateError('a validation error', ['day']),
    });

    wrapper.expectElement('[data-cy="facility-end-date-day"]').hasClass('govuk-input--error');
  });

  it(`month input has error class only when date field error given`, () => {
    wrapper.expectElement('[data-cy="facility-end-date-month"]').doesNotHaveClass('govuk-input--error');

    wrapper = render({
      ...params,
      errors: aFacilityEndDateError('a validation error', ['month']),
    });

    wrapper.expectElement('[data-cy="facility-end-date-month"]').hasClass('govuk-input--error');
  });

  it(`year input has error class only when date field error given`, () => {
    wrapper.expectElement('[data-cy="facility-end-date-year"]').doesNotHaveClass('govuk-input--error');

    wrapper = render({
      ...params,
      errors: aFacilityEndDateError('a validation error', ['year']),
    });

    wrapper.expectElement('[data-cy="facility-end-date-year"]').hasClass('govuk-input--error');
  });

  it('renders the facility end date details', () => {
    wrapper.expectText('[data-cy="facility-end-date-details"] span').toRead('What is a facility end date');
    wrapper
      .expectText('[data-cy="facility-end-date-details"] div')
      .toRead('The facility end date is the deadline for a committed loan to be repaid at which point the contract will be terminated.');
  });
});
