const { pageRenderer } = require('../pageRenderer');

const page = '../templates/case/activity/activity.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const params = {
    deal: {
      submissionType: 'Automatic Inclusion Notice',
    },
    user: {
      timezone: 'Europe/London',
      teams: [],
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="activity-heading"]').toRead('Activity and comments');
  });

  it('should render add a comment button', () => {
    wrapper.expectElement('[data-cy="add-comment-button"]').toExist();
  });

  it('should render activity filter radios', () => {
    wrapper.expectElement('[data-cy="activity-comment-radio-button-all-activities"]').toExist();
    wrapper.expectElement('[data-cy="activity-comment-radio-button-comments-only"]').toExist();
  });

  it('should render timeline', () => {
    wrapper.expectElement('[data-cy="activities-timeline"]').toExist();
  });
});
