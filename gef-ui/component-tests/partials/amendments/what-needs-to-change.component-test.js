const pageRenderer = require('../../pageRenderer');

const page = 'partials/amendments/what-needs-to-change.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const exporterName = 'Test Exporter';
  const previousPage = '/previous-page';

  const params = {
    exporterName,
    previousPage,
    csrfToken: 'test-csrf-token',
    errors: null,
    changeCoverEndDate: false,
    changeFacilityValue: false,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render the page title', () => {
    wrapper.expectText('[data-cy="page-title"]').toRead('What do you need to change?');
  });

  it('should render the exporter name', () => {
    wrapper.expectText('[data-cy="heading-caption"]').toRead(exporterName);
  });

  it('should render the back link', () => {
    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it('should render the amendment selection checkboxes unchecked', () => {
    wrapper.expectInput('[data-cy="cover-end-date-checkbox"]').toNotBeChecked();
    wrapper.expectInput('[data-cy="facility-value-checkbox"]').toNotBeChecked();
  });

  it('should render the warning text', () => {
    wrapper.expectText('[data-cy="warning"]').toContain('Check your records for the most up-to-date values');
  });

  it('should render the continue button', () => {
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render the cancel link', () => {
    wrapper.expectText('[data-cy="cancel-link"]').toRead('Cancel');
  });

  it('should render error summary if errors are present', () => {
    const errorText = 'test error message';

    const errorParams = {
      ...params,
      errors: {
        errorSummary: [{ text: errorText, href: '#amendmentOptions' }],
        fieldErrors: { amendmentSelection: { text: errorText } },
      },
    };

    wrapper = render(errorParams);

    wrapper.expectText('[data-cy="error-summary"]').toContain(errorText);
    wrapper.expectText('[data-cy="selection-error-message"]').toContain(errorText);
  });
});
