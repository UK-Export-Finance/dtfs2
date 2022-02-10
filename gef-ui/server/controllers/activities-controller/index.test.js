import { fromUnixTime } from 'date-fns';
import { mapPortalActivities, getPortalActivities } from './index';

import api from '../../services/api';

import mocks from '../mocks';

jest.mock('../../services/api');

/*
   ensures that the mapPortalActivities returns an array
   in the correct format for mojTimeline
*/

describe('mapPortalActivities', () => {
  const gefActivity = [{
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
    maker: '',
    checker: '',
  }];

  const facilityActivity = [{
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
  }];

  it('should return formatted array for mojTimeline for first submission', () => {
    const response = mapPortalActivities(gefActivity);

    // expected format
    const expected = [{
      label: { text: 'Automatic inclusion notice submitted to UKEF' },
      text: '',
      datetime: { timestamp: fromUnixTime(1638458265), type: 'datetime' },
      byline: { text: 'Bob Smith' },
      html: '',
      facilityType: '',
      ukefFacilityId: '',
      maker: '',
      checker: '',
    }];

    expect(response).toEqual(expected);
  });

  it('should return formatted array for mojTimeline for facility submission', () => {
    const response = mapPortalActivities(facilityActivity);

    // expected format
    const expected = [{
      label: { text: 'Bank facility stage changed' },
      text: '',
      datetime: { timestamp: fromUnixTime(1638458265), type: 'datetime' },
      byline: { text: 'Bob Smith' },
      html: 'facility',
      facilityType: 'Cash facility',
      ukefFacilityId: '12345',
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
    }];

    expect(response).toEqual(expected);
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
  let mockEligibilityCriteriaResponse;

  beforeEach(() => {
    mockResponse = mocks.MockResponse();
    mockRequest = mocks.MockRequestChecker();
    mockApplicationResponse = mocks.MockApplicationResponseSubmitted();
    mockFacilityResponse = mocks.MockFacilityResponse();
    mockUserResponse = mocks.MockUserResponseChecker();
    mockEligibilityCriteriaResponse = mocks.MockEligibilityCriteriaResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(mockFacilityResponse);
    api.getEligibilityCriteria.mockResolvedValue(mockEligibilityCriteriaResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('it should call getApplication to produce mojTimeline array format', async () => {
    await getPortalActivities(mockRequest, mockResponse);

    expect(api.getApplication).toHaveBeenCalledWith(mockRequest.params.dealId);
  });

  it('it should render application-activity template', async () => {
    await getPortalActivities(mockRequest, mockResponse);

    const checker = await api.getUserDetails(mockApplicationResponse.checkerId, mockRequest.session.userToken);

    const mappedPortalActivities = mapPortalActivities(mockApplicationResponse.portalActivities);

    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/application-activity.njk', {
        activeSubNavigation: 'activities',
        dealId: '123',
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
