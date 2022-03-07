const pageRenderer = require('../pageRenderer');

const page = 'feedback/feedback-thankyou.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="thank-you-heading"]').toRead('Feedback');
  });

  it('should render thank you copy', () => {
    wrapper.expectText('[data-cy="thankyou-copy"]').toRead('Thank you for your feedback. We will use your feedback for future improvement. Do let us know if there is anything else we need to know to improve this area of concern.');
  });
});
