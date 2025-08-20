import { fromUnixTime, format } from 'date-fns';
import {
  timezone,
  DATE_FORMATS,
  MAPPED_FACILITY_TYPE,
  PORTAL_ACTIVITY_TYPE,
  PORTAL_ACTIVITY_LABEL,
  UKEF,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
} from '@ukef/dtfs2-common';
import { mapPortalActivities, getPortalActivities } from '.';
import api from '../../services/api';
import mocks from '../mocks';
import MOCK_AUTHOR from '../../utils/mocks/mock-author';

jest.mock('../../services/api');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

const timestamp = 1733311320;
const date = fromUnixTime(timestamp);
const dealId = '123';

const dealSubmissionActivity = [
  {
    label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED,
    text: 'Date effective from: 1 March 2025',
    scheduledCancellation: true,
    timestamp,
    author: {
      _id: '67b311566dc03b7ff5ef2154',
      firstName: UKEF.ACRONYM,
    },
  },
  {
    type: PORTAL_ACTIVITY_TYPE.NOTICE,
    timestamp,
    author: {
      firstName: MOCK_AUTHOR.firstName,
      lastName: MOCK_AUTHOR.lastName,
      _id: MOCK_AUTHOR._id,
    },
    text: '',
    label: PORTAL_ACTIVITY_LABEL.AIN_SUBMISSION,
    html: '',
    facilityType: '',
    ukefFacilityId: '',
    amendmentId: '',
    facilityId: '',
    maker: '',
    checker: '',
  },
];

const facilityActivity = [
  {
    type: PORTAL_ACTIVITY_TYPE.FACILITY_STAGE,
    timestamp,
    author: MOCK_AUTHOR,
    text: '',
    label: PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED,
    html: 'facility',
    facilityType: MAPPED_FACILITY_TYPE.CASH,
    ukefFacilityId: '12345',
    facilityId: '123456',
    amendmentId: '',
    maker: {
      firstname: 'Joe',
      surname: 'Bloggs',
      id: '12345',
    },
    checker: {
      firstname: 'Bob',
      surname: 'Smith',
      id: '4567',
    },
  },
];

const amendmentActivity = [
  {
    type: PORTAL_ACTIVITY_TYPE.ACTIVITY,
    timestamp,
    author: MOCK_AUTHOR,
    text: '',
    label: 'Amendment 12345-001 Approved',
    facilityId: '123456',
    amendmetId: '123456',
    maker: {
      firstname: 'Joe',
      surname: 'Bloggs',
      id: '12345',
    },
    checker: {
      firstname: 'Bob',
      surname: 'Smith',
      id: '4567',
    },
  },
];

describe('mapPortalActivities', () => {
  it('should return a mapped array of deal statuses for portal activities and comments', () => {
    // Act
    const result = mapPortalActivities(dealId, dealSubmissionActivity);

    // Assert
    const expected = [
      {
        title: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED,
        text: 'Date effective from: 1 March 2025',
        date: format(date, DATE_FORMATS.D_MMMM_YYYY),
        time: format(date, DATE_FORMATS.H_MMAAA),
        byline: UKEF.ACRONYM,
        facilityType: undefined,
        ukefFacilityId: undefined,
        facilityId: undefined,
        maker: undefined,
        checker: undefined,
        scheduledCancellation: true,
        amendmentUrl: '',
      },
      {
        title: PORTAL_ACTIVITY_LABEL.AIN_SUBMISSION,
        text: '',
        date: format(date, DATE_FORMATS.D_MMMM_YYYY),
        time: format(date, DATE_FORMATS.H_MMAAA),
        byline: `${MOCK_AUTHOR.firstName} ${MOCK_AUTHOR.lastName}`,
        facilityType: '',
        ukefFacilityId: '',
        facilityId: '',
        maker: '',
        checker: '',
        scheduledCancellation: undefined,
        amendmentUrl: '',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should return a mapped array of facility status for portal activities and comments', () => {
    // Act
    const result = mapPortalActivities(dealId, facilityActivity);

    // Assert
    const expected = [
      {
        title: PORTAL_ACTIVITY_LABEL.FACILITY_CHANGED_ISSUED,
        text: '',
        date: format(date, DATE_FORMATS.D_MMMM_YYYY),
        time: format(date, DATE_FORMATS.H_MMAAA),
        byline: `${MOCK_AUTHOR.firstName} ${MOCK_AUTHOR.lastName}`,
        facilityType: MAPPED_FACILITY_TYPE.CASH,
        ukefFacilityId: '12345',
        facilityId: '123456',
        maker: {
          firstname: 'Joe',
          surname: 'Bloggs',
          id: '12345',
        },
        checker: {
          firstname: 'Bob',
          surname: 'Smith',
          id: '4567',
        },
        scheduledCancellation: undefined,
        amendmentUrl: '',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should return a mapped array of amendments for portal activities and comments', () => {
    // Act
    const result = mapPortalActivities(dealId, amendmentActivity);

    // Assert
    const expected = [
      {
        text: '',
        title: 'Amendment 12345-001 Approved',
        date: format(date, DATE_FORMATS.D_MMMM_YYYY),
        time: format(date, DATE_FORMATS.H_MMAAA),
        byline: `${MOCK_AUTHOR.firstName} ${MOCK_AUTHOR.lastName}`,
        facilityType: undefined,
        maker: {
          firstname: 'Joe',
          surname: 'Bloggs',
          id: '12345',
        },
        checker: {
          firstname: 'Bob',
          surname: 'Smith',
          id: '4567',
        },
        ukefFacilityId: undefined,
        facilityId: '123456',
        scheduledCancellation: undefined,
        amendmentUrl: '',
      },
    ];

    expect(result).toEqual(expected);
  });

  describe('when author.lastName does not exist', () => {
    it('should return a mapped array for portal activities and comments without lastName in byline.text`', () => {
      // Arrange
      const mockActivity = {
        ...dealSubmissionActivity[0],
        author: {
          ...dealSubmissionActivity[0].author,
          lastName: '',
        },
      };
      const mockActivities = [mockActivity];

      // Act
      const result = mapPortalActivities(dealId, mockActivities);

      // Assert
      const expected = mockActivity.author.firstName;
      expect(result[0].byline).toEqual(expected);
    });
  });
});

describe('getPortalActivities', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockFacilityResponse;
  let mockUserResponse;
  let isFeatureFlagEnabledMock;

  beforeEach(() => {
    mockResponse = mocks.MockResponse();
    mockRequest = mocks.MockRequestChecker();
    mockApplicationResponse = mocks.MockApplicationResponseSubmitted();
    mockFacilityResponse = mocks.MockFacilityResponse();
    mockUserResponse = mocks.MockUserResponseChecker();
    isFeatureFlagEnabledMock = true;

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(mockFacilityResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);

    jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(isFeatureFlagEnabledMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getApplication to produce mojTimeline array format', async () => {
    await getPortalActivities(mockRequest, mockResponse);

    expect(api.getApplication).toHaveBeenCalledWith({
      dealId: mockRequest.params.dealId,
      userToken: mockRequest.session.userToken,
    });
  });

  it('should render application-activity template', async () => {
    await getPortalActivities(mockRequest, mockResponse);

    const checker = await api.getUserDetails({
      userId: mockApplicationResponse.checkerId,
      userToken: mockRequest.session.userToken,
    });

    const mappedPortalActivities = mapPortalActivities(dealId, mockApplicationResponse.portalActivities);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/application-activity.njk', {
      isFeatureFlagEnabled: isFeatureFlagEnabledMock,
      activeSubNavigation: 'activities',
      dealId: '1234567890abcdf123456789',
      previousStatus: mockApplicationResponse.previousStatus,
      portalActivities: mappedPortalActivities,
      bankInternalRefName: mockApplicationResponse.bankInternalRefName,
      additionalRefName: mockApplicationResponse.additionalRefName,
      ukefDealId: mockApplicationResponse.ukefDealId,
      applicationStatus: mockApplicationResponse.status,
      applicationType: mockApplicationResponse.submissionType,
      submissionCount: mockApplicationResponse.submissionCount,
      checkedBy: `${checker.firstname} ${checker.surname}`,
      createdBy: `${mockApplicationResponse.maker.firstname} ${mockApplicationResponse.maker.surname}`,
      companyName: mockApplicationResponse.exporter.companyName,
      dateCreated: mockApplicationResponse.createdAt,
      timezone: mockApplicationResponse.maker.timezone || timezone,
      submissionDate: mockApplicationResponse.submissionDate,
      manualInclusionNoticeSubmissionDate: mockApplicationResponse.manualInclusionNoticeSubmissionDate,
    });
  });
});
