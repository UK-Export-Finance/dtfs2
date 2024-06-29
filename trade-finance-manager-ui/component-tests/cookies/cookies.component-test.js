const { pageRenderer } = require('../pageRenderer');

const page = '../templates/cookies.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  beforeEach(() => {
    wrapper = render();
  });

  it('should render cookies heading', () => {
    wrapper.expectText('[data-cy="cookies-heading"]').toRead('Cookies');
  });

  it('should render essential cookies sub heading', () => {
    wrapper.expectText('[data-cy="essential-cookies-heading"]').toRead('Essential Cookies');
  });

  it('should render name under essential cookies sub heading', () => {
    wrapper.expectText('[data-cy="essential-cookies-name"]').toRead('Name');
  });

  it('should render purpose under essential cookies sub heading', () => {
    wrapper.expectText('[data-cy="essential-cookies-purpose"]').toRead('Purpose');
  });

  it('should render expires under essential cookies sub heading', () => {
    wrapper.expectText('[data-cy="essential-cookies-expires"]').toRead('Expires');
  });

  it('should render security under essential cookies name column', () => {
    wrapper.expectText('[data-cy="essential-cookies-name-security"]').toRead('Security');
  });

  it('should render session under essential cookies name column', () => {
    wrapper.expectText('[data-cy="essential-cookies-name-session"]').toRead('Session');
  });
});
