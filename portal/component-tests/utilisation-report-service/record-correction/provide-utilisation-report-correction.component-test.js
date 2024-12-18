const pageRenderer = require('../../pageRenderer');
const { PRIMARY_NAV_KEY } = require('../../../server/constants');

const page = 'utilisation-report-service/record-correction/provide-utilisation-report-correction.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render({
      primaryNav: PRIMARY_NAV_KEY.REPORTS,
      correctionRequestDetails: {},
    });
  });

  it('should render the current record details table', () => {
    wrapper.expectElement('[data-cy="correction-request-details-table"]').toExist();
  });

  it('should render the save button', () => {
    const continueButtonSelector = '[data-cy="continue-button"]';
    wrapper.expectElement(continueButtonSelector).toExist();
    wrapper.expectText(continueButtonSelector).toRead('Save and review changes');
  });

  it('should render the cancel button', () => {
    const cancelButtonSelector = '[data-cy="cancel-button"]';
    wrapper.expectElement(cancelButtonSelector).toExist();
    wrapper.expectElement(cancelButtonSelector).toHaveAttribute('value', 'Cancel record correction');
    wrapper.expectElement(cancelButtonSelector).hasClass('govuk-button--secondary');
  });
});
