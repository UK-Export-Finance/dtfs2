const pageRenderer = require('../pageRenderer');

const page = 'login/index.njk';
const render = pageRenderer(page);

describe(page, () => {
  describe('when the bank list is available', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({
        banks: [{ name: 'Bank A' }, { name: 'Bank B' }],
      });
    });

    it('should render the bank list intro text', () => {
      wrapper.expectText('[data-cy="service"]').toRead("If you've not used this service before");

      wrapper.expectText('p').toContain('Only approved staff at these banks can use this service currently:');
    });

    it('should render the bank names', () => {
      wrapper.expectElement('[data-cy="banks"] li').toHaveCount(2);
      wrapper.expectText('[data-cy="banks"] li:nth-child(1)').toRead('Bank A');
      wrapper.expectText('[data-cy="banks"] li:nth-child(2)').toRead('Bank B');
    });
  });

  describe('when the bank list is unavailable', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ banks: [] });
    });

    it('should render the fallback message as an inset notice', () => {
      wrapper.expectElement('[data-cy="banks-unavailable"]').toExist();
      wrapper.expectElement('div.govuk-inset-text[data-cy="banks-unavailable"]').toExist();
      wrapper
        .expectText('[data-cy="banks-unavailable"]')
        .toContain('The list of banks isn’t available right now. You can still sign in if your bank has been onboarded.');

      wrapper.expectElement('[data-cy="banks"]').notToExist();
    });
  });
});
