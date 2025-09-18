const pageRenderer = require('../pageRenderer');

const page = '_partials/problem-with-service.njk';

const render = pageRenderer(page);

let wrapper;

const params = {
  error: {
    reset: {
      line1: 'Try again later',
      line2: 'The password reset request has not been sent',
      hrefText: 'Back to password reset',
      href: '/dashboard/deals',
    },
  },
};

describe(page, () => {
  it('should render the problem with service heading', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="problem-with-service-heading"]').toRead('Sorry, there is a problem with the service.');
  });

  it('should render the error text1 section if exists', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="error-message-line1"]').toRead('Try again later');
  });

  it('should render the error text2 section if exists', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="error-message-line2"]').toRead('The password reset request has not been sent');
  });

  it('should render the error hrefText section if exists', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="error-message-link"]').toRead('Back to password reset');
  });
});
