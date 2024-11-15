const { READ_ONLY } = require('../../server/constants/roles');
const pageRenderer = require('../pageRenderer');

const page = '_partials/application-activity.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const params = {
    userRoles: [READ_ONLY],
    portalActivities: [
      {
        label: 'Automatic inclusion notice submitted to UKEF',
        text: '',
        dateTime: {
          timestamp: new Date(),
          format: 'datetime',
        },
        byline: {
          text: 'Bob Smith',
        },
      },
    ],
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

  it('should render timeline', () => {
    wrapper.expectElement('[data-cy="portal-activities-timeline"]').toExist();
  });
});
