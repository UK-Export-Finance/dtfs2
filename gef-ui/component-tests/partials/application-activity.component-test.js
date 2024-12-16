const { DEAL_STATUS, FACILITY_STAGE, FACILITY_TYPE, PORTAL_ACTIVITY_LABEL } = require('@ukef/dtfs2-common');
const { READ_ONLY } = require('../../server/constants/roles');
const pageRenderer = require('../pageRenderer');

const page = 'partials/application-activity.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const baseActivity = {
    text: '',
    date: 'Mock data',
    time: 'Mock time',
    byline: 'Bob Smith',
    facilityId: '111',
    ukefFacilityId: '456',
    facilityType: FACILITY_TYPE.CASH,
    maker: {
      firstname: 'Maker first',
      surname: 'Maker last',
    },
    checker: {
      firstname: 'Checker first',
      surname: 'Checker last',
    },
  };

  const mockActivityFacility = {
    ...baseActivity,
    title: PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED,
  };

  const mockActivityDealCancelled = {
    ...baseActivity,
    title: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
  };

  const params = {
    userRoles: [READ_ONLY],
    portalActivities: [],
    dealId: '123',
    ukefDealId: '456',
    previousStatus: DEAL_STATUS.UKEF_ACKNOWLEDGED,
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

  describe(`when the title is ${PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED}`, () => {
    let mockActivity;

    beforeAll(() => {
      mockActivity = mockActivityFacility;

      params.portalActivities = [mockActivity];
    });

    it('should render an `activity` title', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivity.title}-title"]`).toRead(mockActivity.title);
    });

    it('should render an activity byline', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivity.title}-byline"]`).toRead(`by ${mockActivity.byline}`);
    });

    it('should render an activity date', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivity.title}-date"]`).toRead(`${mockActivity.date} ${mockActivity.time}`);
    });

    it('should render `changed by` copy', () => {
      const selector = `[data-cy="facility-changed-by-${mockActivity.ukefFacilityId}"]`;
      const expected = `Changed by ${mockActivity.maker.firstname} ${mockActivity.maker.surname}`;

      wrapper.expectText(selector).toRead(expected);
    });

    it('should render `checked by` copy', () => {
      const selector = `[data-cy="facility-checked-by-${mockActivity.ukefFacilityId}"]`;
      const expected = `Checked by ${mockActivity.checker.firstname} ${mockActivity.checker.surname}`;

      wrapper.expectText(selector).toRead(expected);
    });

    it('should render a facility link', () => {
      const selector = `[data-cy="facility-link-${mockActivity.ukefFacilityId}"]`;
      const expectedHref = `/gef/application-details/${params.dealId}#${mockActivity.facilityId}`;
      const expectedText = `${mockActivity.facilityType}  ${mockActivity.ukefFacilityId}`;

      wrapper.expectLink(selector).toLinkTo(expectedHref, expectedText);
    });

    it('should render `status change` - previous status', () => {
      const selector = `[data-cy="previous-status-tag-${mockActivity.ukefFacilityId}"]`;
      const expected = FACILITY_STAGE.UNISSUED;

      wrapper.expectText(selector).toRead(expected);
    });

    it('should render `status change` - new status', () => {
      const selector = `[data-cy="new-status-tag-${mockActivity.ukefFacilityId}"]`;
      const expected = FACILITY_STAGE.ISSUED;

      wrapper.expectText(selector).toRead(expected);
    });
  });

  describe(`when the title is ${PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED}`, () => {
    let mockActivity;

    beforeAll(() => {
      mockActivity = mockActivityDealCancelled;

      params.portalActivities = [mockActivity];
    });

    it('should render an `activity` title', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivity.title}-title"]`).toRead(mockActivity.title);
    });

    it('should render an activity byline', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivity.title}-byline"]`).toRead(`by ${mockActivity.byline}`);
    });

    it('should render an activity date', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivity.title}-date"]`).toRead(`${mockActivity.date} ${mockActivity.time}`);
    });

    it('should render a deal link', () => {
      const selector = `[data-cy="deal-link-${params.dealId}"]`;
      const expectedHref = `/gef/application-details/${params.dealId}`;
      const expectedText = `Deal ID ${params.ukefDealId}`;

      wrapper.expectLink(selector).toLinkTo(expectedHref, expectedText);
    });

    it('should render `status change` - previous status', () => {
      const selector = `[data-cy="previous-status-tag-${params.dealId}"]`;
      const expected = params.previousStatus;

      wrapper.expectText(selector).toRead(expected);
    });

    it('should render `status change` - new status', () => {
      const selector = `[data-cy="new-status-tag-${params.dealId}"]`;
      const expected = DEAL_STATUS.CANCELLED;

      wrapper.expectText(selector).toRead(expected);
    });
  });
});
