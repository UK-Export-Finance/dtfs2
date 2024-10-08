const pageRenderer = require('../pageRenderer');

const page = 'utilisation-report-service/utilisation-report-upload/check-the-report.njk';
const render = pageRenderer(page);

describe(page, () => {
  const data = {
    validationErrors: [
      {
        errorMessage: 'Fees paid to UKEF for the period header is missing or spelt incorrectly',
        column: null,
        row: null,
        value: null,
        exporter: null,
      },
      {
        errorMessage: 'Facility utilisation must be a number',
        column: 'C',
        row: 3,
        value: 'abc',
        exporter: 'test exporter',
      },
    ],
    errorSummary: [
      {
        text: 'You must correct these errors before you can upload the report',
        href: '#utilisation-report-file-upload',
      },
    ],
    filename: 'test-file.xlsx',
  };

  it('should render the table of validation errors correctly', () => {
    const wrapper = render({ ...data });

    wrapper.expectElement('[data-cy="validation-errors-table"]').toExist();
    wrapper.expectElement('[data-cy="validation-errors-table-row"]').toExist();
  });

  it('should render the input to re-upload a file', () => {
    const wrapper = render({ ...data });

    wrapper.expectElement('[data-cy="utilisation-report-file-upload"]').toExist();
  });
});
