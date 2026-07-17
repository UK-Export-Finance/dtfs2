const pageRenderer = require('../../pageRenderer');

const page = 'includes/submit/submit-to-checker-post-ukef-approval.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render({});
  });

  describe('submit heading', () => {
    it('should render the submit heading as an h2', () => {
      wrapper.expectElement('h2[data-cy="submit-heading"]').toExist();
    });

    it('should render the submit heading with the heading-l class', () => {
      wrapper.expectElement('h2[data-cy="submit-heading"]').hasClass('govuk-heading-l');
    });

    it('should render the submit heading text', () => {
      wrapper.expectText('[data-cy="submit-heading"]').toRead('Submit');
    });
  });

  it('should render the submit-to-checker button', () => {
    wrapper.expectElement('[data-cy="submit-ukef-approved-application-to-checker"]').toExist();
    wrapper.expectText('[data-cy="submit-ukef-approved-application-to-checker"]').toRead('Submit to be checked at your bank');
  });
});
