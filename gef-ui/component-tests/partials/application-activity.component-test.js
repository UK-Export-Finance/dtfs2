const { DEAL_STATUS, FACILITY_STAGE, FACILITY_TYPE, PORTAL_ACTIVITY_LABEL, UKEF, DATE_FORMATS } = require('@ukef/dtfs2-common');
const { fromUnixTime, format } = require('date-fns');
const { READ_ONLY } = require('../../server/constants/roles');
const pageRenderer = require('../pageRenderer');

const page = 'partials/application-activity.njk';
const render = pageRenderer(page);

const timestamp = 0;
const toDate = fromUnixTime(new Date(timestamp));
const date = format(toDate, DATE_FORMATS.D_MMMM_YYYY);
const time = format(toDate, DATE_FORMATS.H_MMAAA);

describe(page, () => {
  let wrapper;

  const params = {
    userRoles: [READ_ONLY],
    portalActivities: [],
    dealId: '123',
    ukefDealId: '456',
    previousStatus: DEAL_STATUS.UKEF_ACKNOWLEDGED,
  };

  const portalActivities = [
    {
      text: '',
      timestamp,
      date,
      time,
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
    },
    {
      text: 'Date effective from: 1 January 1970',
      byline: UKEF.ACRONYM,
      date,
      time,
    },
  ];

  const mockActivityFacility = {
    ...portalActivities[0],
    title: PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED,
  };

  const mockActivityDealCancelled = {
    ...portalActivities[1],
    title: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
  };

  const mockActivityDealScheduledCancellation = {
    ...portalActivities[1],
    title: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED,
    scheduledCancellation: true,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('should render core page components', () => {
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
  });

  describe(`when the title is ${PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED}`, () => {
    beforeAll(() => {
      params.portalActivities = [mockActivityFacility];
    });

    it('should render an `activity` title', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityFacility.title}-title"]`).toRead(mockActivityFacility.title);
    });

    it('should render an activity byline', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityFacility.title}-byline"]`).toRead(`by ${mockActivityFacility.byline}`);
    });

    it('should render an activity date', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityFacility.title}-date"]`).toRead(`${mockActivityFacility.date} ${mockActivityFacility.time}`);
    });

    it('should render `changed by` copy', () => {
      const selector = `[data-cy="facility-changed-by-${mockActivityFacility.ukefFacilityId}"]`;
      const expected = `Changed by ${mockActivityFacility.maker.firstname} ${mockActivityFacility.maker.surname}`;

      wrapper.expectText(selector).toRead(expected);
    });

    it('should render `checked by` copy', () => {
      const selector = `[data-cy="facility-checked-by-${mockActivityFacility.ukefFacilityId}"]`;
      const expected = `Checked by ${mockActivityFacility.checker.firstname} ${mockActivityFacility.checker.surname}`;

      wrapper.expectText(selector).toRead(expected);
    });

    it('should render a facility link', () => {
      const selector = `[data-cy="facility-link-${mockActivityFacility.ukefFacilityId}"]`;
      const expectedHref = `/gef/application-details/${params.dealId}#${mockActivityFacility.facilityId}`;
      const expectedText = `${mockActivityFacility.facilityType}  ${mockActivityFacility.ukefFacilityId}`;

      wrapper.expectLink(selector).toLinkTo(expectedHref, expectedText);
    });

    it('should render `status change` - previous status', () => {
      const selector = `[data-cy="previous-status-tag-${mockActivityFacility.ukefFacilityId}"]`;
      const expected = FACILITY_STAGE.UNISSUED;

      wrapper.expectText(selector).toRead(expected);
    });

    it('should render `status change` - new status', () => {
      const selector = `[data-cy="new-status-tag-${mockActivityFacility.ukefFacilityId}"]`;
      const expected = FACILITY_STAGE.ISSUED;

      wrapper.expectText(selector).toRead(expected);
    });
  });

  describe(`when the title is ${PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED}`, () => {
    beforeAll(() => {
      params.portalActivities = [mockActivityDealCancelled];
    });

    it('should render an `activity` title', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityDealCancelled.title}-title"]`).toRead(mockActivityDealCancelled.title);
    });

    it('should render an activity byline', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityDealCancelled.title}-byline"]`).toRead(`by ${mockActivityDealCancelled.byline}`);
    });

    it('should render an activity date', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityDealCancelled.title}-date"]`).toRead(`${date} ${time}`);
    });

    it('should render a deal link', () => {
      const selector = `[data-cy="deal-link-${params.dealId}"]`;
      const expectedHref = `/gef/application-details/${params.dealId}`;
      const expectedText = `Deal ID ${params.ukefDealId}`;

      wrapper.expectLink(selector).toLinkTo(expectedHref, expectedText);
    });

    it('should render status change, new tag', () => {
      const selector = `[data-cy="new-status-tag-${params.dealId}"]`;
      const expected = DEAL_STATUS.CANCELLED;

      wrapper.expectText(selector).toRead(expected);
    });
  });

  describe(`when the title is ${PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED}`, () => {
    beforeAll(() => {
      params.portalActivities = [mockActivityDealScheduledCancellation];
    });

    it('should render an `activity` title', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityDealScheduledCancellation.title}-title"]`).toRead(mockActivityDealScheduledCancellation.title);
    });

    it('should render an activity byline', () => {
      wrapper
        .expectText(`[data-cy="activity-${mockActivityDealScheduledCancellation.title}-byline"]`)
        .toRead(`by ${mockActivityDealScheduledCancellation.byline}`);
    });

    it('should render an activity date', () => {
      wrapper.expectText(`[data-cy="activity-${mockActivityDealScheduledCancellation.title}-date"]`).toRead(`${date} ${time}`);
    });

    it('should render a deal link', () => {
      const selector = `[data-cy="deal-link-${params.dealId}"]`;
      const expectedHref = `/gef/application-details/${params.dealId}`;
      const expectedText = `Deal ID ${params.ukefDealId}`;

      wrapper.expectLink(selector).toLinkTo(expectedHref, expectedText);
    });

    it('should render status change, new tag', () => {
      const selector = `[data-cy="new-status-tag-${params.dealId}"]`;
      const expected = DEAL_STATUS.PENDING_CANCELLATION;

      wrapper.expectText(selector).toRead(expected);
    });
  });
});
