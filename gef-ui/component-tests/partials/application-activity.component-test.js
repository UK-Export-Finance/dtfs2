const { READ_ONLY } = require('../../server/constants/roles');
const pageRenderer = require('../pageRenderer');

const page = 'partials/application-activity.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const mockActivity = {
    title: 'Mock title',
    text: '',
    date: 'Mock data',
    time: 'Mock time',
    byline: 'Bob Smith',
  };

  const params = {
    userRoles: [READ_ONLY],
    portalActivities: [mockActivity],
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="main-activity-heading"]').toRead('Activity and comments');
  });

  it('should render sub navigation component', () => {
    wrapper.expectElement('[data-cy="application-preview-sub-navigation"]').toExist();
  });

  it('should render status box', () => {
    wrapper.expectElement('[data-cy="application-banner"]').toExist();
  });

  it('should render a timeline', () => {
    wrapper.expectElement('[data-cy="portal-activities-timeline"]').toExist();
  });

  it('should render an activity title', () => {
    wrapper.expectText(`[data-cy="activity-${mockActivity.title}-title"]`).toRead(mockActivity.title);
  });

  it('should render an activity byline', () => {
    wrapper.expectText(`[data-cy="activity-${mockActivity.title}-byline"]`).toRead(`by ${mockActivity.byline}`);
  });

  it('should render an activity date', () => {
    wrapper.expectText(`[data-cy="activity-${mockActivity.title}-time"]`).toRead(`${mockActivity.date} ${mockActivity.time}`);
  });
});
