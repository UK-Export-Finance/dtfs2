const pageRenderer = require('../../../component-tests/pageRenderer');
const page = '../templates/case/activity/activity.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const params = {
    deal: {
      details: {
        submissionType: 'Automatic Inclusion Notice',
      },
    },
    user: {
      timezone: 'Europe/London',
    }
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="activity-heading"]').toRead('Activity and comments');
  });

  it('should render dealSubmitted component', () => {
    wrapper.expectElement('[data-cy="activity-deal-submitted"]').toExist();
  });
});
