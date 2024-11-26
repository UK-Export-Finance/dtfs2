import { fromUnixTime } from 'date-fns';
import { mapPortalActivities, getPortalActivities } from '.';
import api from '../../services/api';
import mocks from '../mocks';

jest.mock('../../services/api');

const dealSubmissionActivity = [
  {
    type: 'NOTICE',
    timestamp: 1638458265,
    author: {
      firstName: 'Bob',
      lastName: 'Smith',
      _id: 12345,
    },
    text: '',
    label: 'Automatic inclusion notice submitted to UKEF',
    html: '',
    facilityType: '',
    ukefFacilityId: '',
    facilityId: '',
    maker: '',
    checker: '',
  },
];

const facilityActivity = [
  {
    type: 'FACILITY_STAGE',
    timestamp: 1638458265,
    author: {
      firstName: 'Bob',
      lastName: 'Smith',
      _id: 12345,
    },
    text: '',
    label: 'Bank facility stage changed',
    html: 'facility',
    facilityType: 'Cash facility',
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
  },
];

describe('mapPortalActivities', () => {
  it('should return a mapped array for mojTimeline for `AIN deal submission`', () => {
    const result = mapPortalActivities(dealSubmissionActivity);

    const expected = [
      {
        label: { text: 'Automatic inclusion notice submitted to UKEF' },
        text: '',
        datetime: { timestamp: fromUnixTime(1638458265), type: 'datetime' },
        byline: { text: 'Bob Smith' },
        html: '',
        facilityType: '',
        ukefFacilityId: '',
        facilityId: '',
        maker: '',
        checker: '',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should return a mapped array for mojTimeline for `facility stage changed`', () => {
    const result = mapPortalActivities(facilityActivity);

    const expected = [
      {
        label: { text: 'Bank facility stage changed' },
        text: '',
        datetime: { timestamp: fromUnixTime(1638458265), type: 'datetime' },
        byline: { text: 'Bob Smith' },
        html: 'facility',
        facilityType: 'Cash facility',
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
      },
    ];

    expect(result).toEqual(expected);
  });

  describe('when author.lastName does not exist', () => {
    it('should return a mapped array for mojTimeline for `facility stage changed`', () => {
      const mockActivity = dealSubmissionActivity;
      mockActivity[0].author.lastName = '';

      const result = mapPortalActivities(mockActivity);

      const expected = mockActivity[0].author.firstName;

      expect(result[0].byline.text).toEqual(expected);
    });
  });
});

/*
   tests that getPortalActivities makes the required API calls
   and that the correct template is rendered with the required fields
*/
describe('getPortalActivities()', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockFacilityResponse;
  let mockUserResponse;

  beforeEach(() => {
    mockResponse = mocks.MockResponse();
    mockRequest = mocks.MockRequestChecker();
    mockApplicationResponse = mocks.MockApplicationResponseSubmitted();
    mockFacilityResponse = mocks.MockFacilityResponse();
    mockUserResponse = mocks.MockUserResponseChecker();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(mockFacilityResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);
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

    const mappedPortalActivities = mapPortalActivities(mockApplicationResponse.portalActivities);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/application-activity.njk', {
      activeSubNavigation: 'activities',
      dealId: '1234567890abcdf123456789',
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
      timezone: mockApplicationResponse.maker.timezone || 'Europe/London',
      submissionDate: mockApplicationResponse.submissionDate,
      manualInclusionNoticeSubmissionDate: mockApplicationResponse.manualInclusionNoticeSubmissionDate,
    });
  });
});
