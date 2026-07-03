const pageRenderer = require('../../pageRenderer');

const page = 'includes/submit/submit-to-checker.njk';
const render = pageRenderer(page);

describe(page, () => {
  describe('submit heading', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ submit: true });
    });

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

  describe('when submit is true', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ submit: true });
    });

    it('should render the submit button', () => {
      wrapper.expectElement('[data-cy="submit-button"]').toExist();
      wrapper.expectText('[data-cy="submit-button"]').toRead('Submit to be checked at your bank');
    });

    it('should not render the validation text', () => {
      wrapper.expectElement('[data-cy="submit-validation-text"]').notToExist();
    });
  });

  describe('when submit is false', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ submit: false });
    });

    it('should render the validation text', () => {
      wrapper.expectElement('[data-cy="submit-validation-text"]').toExist();
      wrapper.expectText('[data-cy="submit-validation-text"]').toRead('You cannot submit yet - you must complete all required sections first.');
    });

    it('should not render the submit button', () => {
      wrapper.expectElement('[data-cy="submit-button"]').notToExist();
    });
  });
});
