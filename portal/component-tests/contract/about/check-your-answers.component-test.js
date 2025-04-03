const pageRenderer = require('../../pageRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'contract/about/about-supply-check-your-answers.njk';
const render = pageRenderer(component);

describe(component, () => {
  let wrapper;
  const { submissionDetails } = deal;

  beforeEach(() => {
    wrapper = render(submissionDetails);
  });

  describe('print button', () => {
    it('should render print button', () => {
      wrapper.expectElement('[data-cy="print-button"]').toExist();
      wrapper.expectText('[data-cy="print-button"]').toRead('Print');
    });

    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/printPage.js"]')
        .toHaveAttribute('integrity', 'sha512-ADkS6GB/rgAPwWTnZ9lAIRfzR1mDYDjDIGGn7x95Um00JgUw+W2IjHkF5TORkvgn5SqpHTVZE7CIvI+/KBgh5w==');
    });
  });
});
