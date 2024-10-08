const { componentRenderer } = require('../../../componentRenderer');

const component = '../templates/case/activity/_macros/deal-submitted.njk';
const { localiseTimestamp } = require('../../../../server/nunjucks-configuration/filter-localiseTimestamp');

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    submissionType: 'Automatic Inclusion Notice',
    submittedBy: 'Test User',
    submissionDate: '12345678910',
    userTimezone: 'Europe/London',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render list item with correct class name', () => {
    wrapper.expectElement('[data-cy="activity-deal-submitted"]').hasClass('list-style-type-none');
    wrapper.expectElement('[data-cy="activity-deal-submitted"]').hasClass('ukef-activity-feed__list-item');
  });

  it('should render heading with user text and correct classes', () => {
    const expectedHeading = `${params.submissionType} submitted by ${params.submittedBy}`;
    wrapper.expectText('[data-cy="activity-feed-list-item-heading"]').toRead(expectedHeading);
    wrapper.expectElement('[data-cy="activity-feed-list-item-heading"]').hasClass('ukef-activity-feed__list-item-heading');

    const expectedUserText = `by ${params.submittedBy}`;
    wrapper.expectText('[data-cy="activity-feed-list-item-heading-user"]').toRead(expectedUserText);
    wrapper.expectElement('[data-cy="activity-feed-list-item-heading-user"]').hasClass('ukef-activity-feed__list-item-heading-user');
  });

  it('should render submissionDate', () => {
    const expectedDate = localiseTimestamp(params.submissionDate, 'd MMMM yyyy', params.userTimezone);
    const expectedTime = localiseTimestamp(params.submissionDate, 'HH:mmaaa', params.userTimezone);

    const expected = `${expectedDate} at ${expectedTime}`;

    wrapper.expectText('[data-cy="activity-feed-list-item-submission-date"]').toRead(expected);
  });
});
