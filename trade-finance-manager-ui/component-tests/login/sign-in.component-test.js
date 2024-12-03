const { pageRenderer } = require('../pageRenderer');

const page = '../templates/login.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render Sign in button', () => {
    wrapper.expectText('[data-cy="submit-button"]').toRead('Sign in');
  });

  it('should render Feedback link', () => {
    wrapper.expectText('[data-cy="beta-feedback-link"]').toRead('feedback');
  });

  it('should render Contact Us under Footer', () => {
    wrapper.expectText('[data-cy="contact-us-footer"]').toRead('Contact us');
  });

  it('should render Cookies link under Contact Us', () => {
    wrapper.expectText('[data-cy="cookies-link"]').toRead('Cookies');
  });

  it('should render Accessibility Statement link under Contact Us', () => {
    wrapper.expectText('[data-cy="accessibility-statement-link"]').toRead('Accessibility statement');
  });
});
