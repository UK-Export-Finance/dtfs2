const pageRenderer = require('../pageRenderer');

const page = '../templates/application-details-submitted.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render skip to main content link', () => {
    wrapper.expectLink('[data-cy="skip-link"]').toLinkTo('#main-content', 'Skip to main content');
    wrapper.expectElement('#main-content').toExist();
  });

  it('should have the correct integrity for "/assets/js/main.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/main.js"]')
      .toHaveAttribute('integrity', 'sha512-ojIUnTEiAYeNOJBxTT3Lbj/daIeiKfXu/mEDs5nWVBAViFcM2H4NLLUSFe12xzjs976d4m6HTZbCh16gsHqEkQ==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-J7M6h2SLRry/vn/9BNWTYOPXNSctUYsQLQQDNxmdDna+PYXKdujzcnepkbr3pgPOobUP878GIdOGsPjxfh8EFw==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-eOl0TifTsZ/1GhH6FNfs6SoJhL0shOkKCDjvLnC9+Ewwp6n6uYwIXuiQqphBMSVenttWkRWfM2Fqs6zCvneIzw==');
  });

  it('should have the correct integrity for "/assets/js/maskedInputs.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/maskedInputs.js"]')
      .toHaveAttribute('integrity', 'sha512-4XTH3IT3oQN/60lRAdBZWXMXq4/L1n5kUoGEftu+nY0Bba/7T0RDIZ62es6v+dCyNJ+uaYZTjWl3nPYv0rR6WA==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-RwF5ml+CiOHtgzu/uJmiCoytVi+TMCZGAKWvD+meYlY8bxi+kxC2qMDDiAyi17CoSK5rzB9DO4lej7QRXz8sQQ==');
  });
});
