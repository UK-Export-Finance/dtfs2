import { add, format, sub } from 'date-fns';
import {
  renderChangeFacilityPartial,
  changeUnissuedFacility,
  changeUnissuedFacilityPreview,
  postChangeUnissuedFacility,
  postChangeUnissuedFacilityPreview,
  changeIssuedToUnissuedFacility,
  postChangeIssuedToUnissuedFacility,
} from './index';
import api from '../../services/api';
import MOCKS from '../mocks/index';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');
const userToken = 'test-token';

const facilityId = 'xyz';

const mockExpectedFacilityRenderChange = (change, dealVersion) => ({
  facilityType: CONSTANTS.FACILITY_TYPE.CASH,
  facilityName: 'UKEF123',
  hasBeenIssued: true,
  monthsOfCover: '30',
  shouldCoverStartOnSubmission: 'true',
  issueDateDay: '5',
  issueDateMonth: '1',
  issueDateYear: '2022',
  coverStartDateDay: '2',
  coverStartDateMonth: '1',
  coverStartDateYear: '2022',
  coverEndDateDay: '2',
  coverEndDateMonth: '1',
  coverEndDateYear: '2030',
  facilityTypeString: 'cash',
  dealId: '1234567890abcdf123456789',
  facilityId,
  status: 'change',
  change,
  isFacilityEndDateEnabled: dealVersion >= 1,
});

describe('renderChangeFacilityPartial()', () => {
  let mockRequest;
  let mockFacilityResponse;

  describe.each([0, 1])('with GEF_DEAL_VERSION = %s', (dealVersion) => {
    beforeEach(() => {
      mockRequest = MOCKS.MockRequestUnissued();
      mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

      api.getApplication.mockResolvedValue({ ...MOCKS.MockApplicationResponseSubmitted(), version: dealVersion });
      api.getFacility.mockResolvedValue(mockFacilityResponse);
      api.updateFacility.mockResolvedValue({});
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('returns an object with expected parameters for changeUnissuedFacility', async () => {
      mockRequest.query.status = 'change';

      const result = await renderChangeFacilityPartial({
        params: mockRequest.params,
        query: mockRequest.query,
        change: true,
        userToken,
      });

      const expected = mockExpectedFacilityRenderChange(true, dealVersion);

      expect(result).toEqual(expected);
    });

    it('returns an object with expected parameters for changeUnissuedFacilityPreview', async () => {
      mockRequest.query.status = 'change';
      const result = await renderChangeFacilityPartial({
        params: mockRequest.params,
        query: mockRequest.query,
        change: false,
        userToken,
      });

      const expected = mockExpectedFacilityRenderChange(false, dealVersion);

      expect(result).toEqual(expected);
    });
  });
});

describe('changeUnissuedFacility()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

    api.getApplication.mockResolvedValue(MOCKS.MockApplicationResponseSubmitted());
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('changeUnissuedFacility should call renderChangeFacilityPartial with false', async () => {
    mockRequest.query.status = 'change';

    await changeUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith(
      'partials/unissued-change-about-facility.njk',
      expect.objectContaining({
        change: false,
      }),
    );
  });

  it('changeUnissuedFacility should not call renderChangeFacilityPartial with true', async () => {
    mockRequest.query.status = 'change';

    await changeUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith(
      'partials/unissued-change-about-facility.njk',
      expect.objectContaining({
        change: true,
      }),
    );
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getFacility.mockRejectedValueOnce();
    await changeUnissuedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('changeUnissuedFacilityPreview()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

    api.getApplication.mockResolvedValue(MOCKS.MockApplicationResponseSubmitted());
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('changeUnissuedFacilityPreview should call renderChangeFacilityPartial with true', async () => {
    mockRequest.query.status = 'change';

    await changeUnissuedFacilityPreview(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith(
      'partials/unissued-change-about-facility.njk',
      expect.objectContaining({
        change: true,
      }),
    );
  });

  it('changeUnissuedFacilityPreview should not call renderChangeFacilityPartial with false', async () => {
    mockRequest.query.status = 'change';

    await changeUnissuedFacilityPreview(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith(
      'partials/unissued-change-about-facility.njk',
      expect.objectContaining({
        change: false,
      }),
    );
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getFacility.mockRejectedValueOnce();
    await changeUnissuedFacilityPreview(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('postChangeUnissuedFacility()', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockUserResponse;
  let mockFacilityResponse;
  let mockFacilitiesResponse;
  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockUserResponse = MOCKS.MockUserResponse();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();
    mockFacilitiesResponse = MOCKS.MockFacilitiesResponse();

    api.getUserDetails.mockResolvedValue(mockUserResponse);
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
    api.updateFacility.mockResolvedValue({});
    api.updateApplication = updateApplicationSpy;
    mockRequest.flash = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const yesterday = sub(now, { days: 1 });
  const twoDaysAgo = sub(now, { days: 2 });
  const twoDaysAgoMidnight = new Date(twoDaysAgo).setHours(0, 0, 0, 0);
  const twoYearFromNow = add(now, { years: 2, months: 3, days: 1 });
  const threeYearFromNow = add(now, { years: 3, months: 3, days: 1 });

  const maker = {
    _id: '12345',
    firstname: 'Test',
    surname: 'Test',
  };

  describe.each([0, 1])('with GEF_DEAL_VERSION = %s', (dealVersion) => {
    const isFacilityEndDateEnabled = dealVersion >= 1;

    beforeEach(() => {
      mockApplicationResponse = { ...MOCKS.MockApplicationResponseSubmitted(), version: dealVersion };

      api.getApplication.mockResolvedValue(mockApplicationResponse);
    });

    it('updates the facility when all values are valid', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      const expected = {
        facilityId,
        payload: {
          coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
          coverStartDate: format(now, 'MMMM d, yyyy'),
          issueDate: format(now, 'MMMM d, yyyy'),
          shouldCoverStartOnSubmission: false,
          monthsOfCover: 30,
          name: 'UKEF123',
          hasBeenIssued: true,
          canResubmitIssuedFacilities: true,
          coverDateConfirmed: true,
          unissuedToIssuedByMaker: maker,
        },
        userToken,
      };

      if (isFacilityEndDateEnabled) {
        expected.payload.isUsingFacilityEndDate = true;
      }

      expect(api.updateFacility).toHaveBeenCalledWith(expected);
    });

    it('adds a successMessage to flash storage', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacility(mockRequest, mockResponse);
      expect(mockRequest.flash).toHaveBeenCalledWith('success', { message: 'UKEF123 is updated' });
    });

    it('calls api.updateApplication with editorId if successfully updates facility', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('should not update facility if issue date before submissionDate', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = false;
      mockRequest.body['issue-date-day'] = format(twoDaysAgoMidnight, 'd');
      mockRequest.body['issue-date-month'] = format(twoDaysAgoMidnight, 'M');
      mockRequest.body['issue-date-year'] = format(twoDaysAgoMidnight, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/unissued-change-about-facility.njk',
        expect.objectContaining({
          errors: {
            errorSummary: [
              {
                text: 'The issue date must not be before the date of the inclusion notice submission date',
                href: '#issueDate',
              },
            ],
            fieldErrors: {
              issueDate: { text: 'The issue date must not be before the date of the inclusion notice submission date' },
            },
          },
        }),
      );

      // should not go ahead with call as errors
      expect(api.updateFacility).not.toHaveBeenCalled();
    });

    it('posts and returns correct message and url if submission date in past and issue date on same day of submission', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(yesterday, 'd');
      mockRequest.body['issue-date-month'] = format(yesterday, 'M');
      mockRequest.body['issue-date-year'] = format(yesterday, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      const expected = {
        facilityId,
        payload: {
          coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
          coverStartDate: format(yesterday, 'MMMM d, yyyy'),
          issueDate: format(yesterday, 'MMMM d, yyyy'),
          shouldCoverStartOnSubmission: false,
          monthsOfCover: 30,
          name: 'UKEF123',
          hasBeenIssued: true,
          canResubmitIssuedFacilities: true,
          coverDateConfirmed: true,
          unissuedToIssuedByMaker: maker,
        },
        userToken,
      };

      if (isFacilityEndDateEnabled) {
        expected.payload.isUsingFacilityEndDate = true;
      }

      expect(api.updateFacility).toHaveBeenCalledWith(expected);
    });

    it('should not update facility if no name or dates', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityId = facilityId;

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/unissued-change-about-facility.njk',
        expect.objectContaining({
          errors: {
            errorSummary: [
              {
                text: 'Enter a name for this cash facility',
                href: '#facilityName',
              },
              {
                text: 'Enter the date you issued the facility to the exporter',
                href: '#issueDate',
              },
              {
                text: 'Select if you want UKEF cover to start on the day you issue the facility',
                href: '#shouldCoverStartOnSubmission',
              },
              { text: 'Enter a cover end date', href: '#coverEndDate' },
            ],
            fieldErrors: {
              facilityName: { text: 'Enter a name for this cash facility' },
              issueDate: { text: 'Enter the date you issued the facility to the exporter' },
              shouldCoverStartOnSubmission: {
                text: 'Select if you want UKEF cover to start on the day you issue the facility',
              },
              coverEndDate: { text: 'Enter a cover end date' },
            },
          },
        }),
      );

      // should not go ahead with call as errors
      expect(api.updateFacility).not.toHaveBeenCalled();
    });

    it('should update facility if specialIssuePermission is true and coverStartDate is more than 3 months in the future', async () => {
      api.getFacility.mockResolvedValue(MOCKS.MockFacilityResponseSpecialIssue());

      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(twoYearFromNow, 'd');
      mockRequest.body['cover-start-date-month'] = format(twoYearFromNow, 'M');
      mockRequest.body['cover-start-date-year'] = format(twoYearFromNow, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(threeYearFromNow, 'd');
      mockRequest.body['cover-end-date-month'] = format(threeYearFromNow, 'M');
      mockRequest.body['cover-end-date-year'] = format(threeYearFromNow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      const expected = {
        facilityId,
        payload: {
          coverEndDate: format(threeYearFromNow, 'MMMM d, yyyy'),
          coverStartDate: format(twoYearFromNow, 'MMMM d, yyyy'),
          issueDate: format(now, 'MMMM d, yyyy'),
          shouldCoverStartOnSubmission: false,
          monthsOfCover: null,
          name: 'UKEF123',
          hasBeenIssued: true,
          canResubmitIssuedFacilities: true,
          coverDateConfirmed: true,
          unissuedToIssuedByMaker: maker,
        },
        userToken,
      };

      if (isFacilityEndDateEnabled) {
        expected.payload.isUsingFacilityEndDate = true;
      }

      // should not go ahead with call as errors
      expect(api.updateFacility).toHaveBeenCalledWith(expected);
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      api.updateFacility.mockRejectedValueOnce();
      await postChangeUnissuedFacility(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('with GEF_DEAL_VERSION = 1', () => {
    beforeEach(() => {
      mockApplicationResponse = { ...MOCKS.MockApplicationResponseSubmitted(), version: '1' };

      api.getApplication.mockResolvedValue(mockApplicationResponse);
    });

    it('should not update facility if isUsingFacilityEndDate is not provided', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(yesterday, 'd');
      mockRequest.body['issue-date-month'] = format(yesterday, 'M');
      mockRequest.body['issue-date-year'] = format(yesterday, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/unissued-change-about-facility.njk',
        expect.objectContaining({
          errors: {
            errorSummary: [{ href: '#isUsingFacilityEndDate', text: 'Select if there is an end date for this facility' }],
            fieldErrors: {
              isUsingFacilityEndDate: { text: 'Select if there is an end date for this facility' },
            },
          },
        }),
      );

      // should not go ahead with call as errors
      expect(api.updateFacility).not.toHaveBeenCalled();
    });

    it('redirects the user to the facility end date page if using facility end date', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      mockRequest.body.isUsingFacilityEndDate = 'true';

      mockRequest.session.userToken = userToken;
      const { dealId } = mockRequest.params;

      await postChangeUnissuedFacility(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith(`/gef/application-details/${dealId}/unissued-facilities/${facilityId}/facility-end-date`);
    });
  });

  describe('with GEF_DEAL_VERSION = 0', () => {
    beforeEach(() => {
      mockApplicationResponse = { ...MOCKS.MockApplicationResponseSubmitted(), version: '0' };

      api.getApplication.mockResolvedValue(mockApplicationResponse);
    });

    it('redirects the user to the unissued facilities page', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      mockRequest.session.userToken = userToken;
      const { dealId } = mockRequest.params;

      await postChangeUnissuedFacility(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith(`/gef/application-details/${dealId}/unissued-facilities`);
    });
  });
});

describe('postChangeUnissuedFacilityPreview()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;
  let mockFacilitiesResponse;
  let mockUserResponse;
  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();
    mockFacilitiesResponse = MOCKS.MockFacilitiesResponse();
    mockUserResponse = MOCKS.MockUserResponse();

    api.getUserDetails.mockResolvedValue(mockUserResponse);
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
    api.updateFacility.mockResolvedValue({});
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const twoYearFromNow = add(now, { years: 2, months: 3, days: 1 });
  const threeYearFromNow = add(now, { years: 3, months: 3, days: 1 });

  const maker = {
    _id: '12345',
    firstname: 'Test',
    surname: 'Test',
  };

  describe.each([0, 1])('with GEF_DEAL_VERSION = %s', (dealVersion) => {
    const isFacilityEndDateEnabled = dealVersion >= 1;

    beforeEach(() => {
      const mockApplicationResponse = { ...MOCKS.MockApplicationResponseSubmitted(), version: dealVersion };

      api.getApplication.mockResolvedValue(mockApplicationResponse);
    });

    it('posts and returns correct url', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);

      const expected = {
        facilityId,
        payload: {
          coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
          coverStartDate: format(now, 'MMMM d, yyyy'),
          issueDate: format(now, 'MMMM d, yyyy'),
          shouldCoverStartOnSubmission: false,
          monthsOfCover: 30,
          name: 'UKEF123',
          hasBeenIssued: true,
          canResubmitIssuedFacilities: true,
          coverDateConfirmed: true,
          unissuedToIssuedByMaker: maker,
        },
        userToken,
      };

      if (isFacilityEndDateEnabled) {
        expected.payload.isUsingFacilityEndDate = true;
      }

      expect(api.updateFacility).toHaveBeenCalledWith(expected);
    });

    it('calls api.updateApplication with editorId if successfully updates facility', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('should not update facility if no name or dates', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      await postChangeUnissuedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/unissued-change-about-facility.njk',
        expect.objectContaining({
          errors: {
            errorSummary: [
              {
                text: 'Enter a name for this cash facility',
                href: '#facilityName',
              },
              {
                text: 'Enter the date you issued the facility to the exporter',
                href: '#issueDate',
              },
              {
                text: 'Select if you want UKEF cover to start on the day you issue the facility',
                href: '#shouldCoverStartOnSubmission',
              },
              { text: 'Enter a cover end date', href: '#coverEndDate' },
            ],
            fieldErrors: {
              facilityName: { text: 'Enter a name for this cash facility' },
              issueDate: { text: 'Enter the date you issued the facility to the exporter' },
              shouldCoverStartOnSubmission: {
                text: 'Select if you want UKEF cover to start on the day you issue the facility',
              },
              coverEndDate: { text: 'Enter a cover end date' },
            },
          },
        }),
      );
      // should not go ahead with call as errors
      expect(api.updateFacility).not.toHaveBeenCalled();
    });

    it('should update facility if specialIssuePermission is true and coverStartDate is more than 3 months in the future', async () => {
      api.getFacility.mockResolvedValue(MOCKS.MockFacilityResponseSpecialIssue());

      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.query.saveAndReturn = 'true';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(twoYearFromNow, 'd');
      mockRequest.body['cover-start-date-month'] = format(twoYearFromNow, 'M');
      mockRequest.body['cover-start-date-year'] = format(twoYearFromNow, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(threeYearFromNow, 'd');
      mockRequest.body['cover-end-date-month'] = format(threeYearFromNow, 'M');
      mockRequest.body['cover-end-date-year'] = format(threeYearFromNow, 'yyyy');

      if (isFacilityEndDateEnabled) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);

      const expected = {
        facilityId,
        payload: {
          coverEndDate: format(threeYearFromNow, 'MMMM d, yyyy'),
          coverStartDate: format(twoYearFromNow, 'MMMM d, yyyy'),
          issueDate: format(now, 'MMMM d, yyyy'),
          shouldCoverStartOnSubmission: false,
          monthsOfCover: null,
          name: 'UKEF123',
          hasBeenIssued: true,
          canResubmitIssuedFacilities: true,
          coverDateConfirmed: true,
          unissuedToIssuedByMaker: maker,
        },
        userToken,
      };

      if (isFacilityEndDateEnabled) {
        expected.payload.isUsingFacilityEndDate = true;
      }

      // should not go ahead with call as errors
      expect(api.updateFacility).toHaveBeenCalledWith(expected);
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      api.updateFacility.mockRejectedValueOnce();
      await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('with GEF_DEAL_VERSION = 1', () => {
    beforeEach(() => {
      const mockApplicationResponse = { ...MOCKS.MockApplicationResponseSubmitted(), version: '1' };

      api.getApplication.mockResolvedValue(mockApplicationResponse);
    });

    it('should not update facility if isUsingFacilityEndDate is not provided', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'UKEF123';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';

      mockRequest.body['issue-date-day'] = format(now, 'd');
      mockRequest.body['issue-date-month'] = format(now, 'M');
      mockRequest.body['issue-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      mockRequest.session.userToken = userToken;

      await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/unissued-change-about-facility.njk',
        expect.objectContaining({
          errors: {
            errorSummary: [{ href: '#isUsingFacilityEndDate', text: 'Select if there is an end date for this facility' }],
            fieldErrors: {
              isUsingFacilityEndDate: { text: 'Select if there is an end date for this facility' },
            },
          },
        }),
      );

      // should not go ahead with call as errors
      expect(api.updateFacility).not.toHaveBeenCalled();
    });
  });
});

describe('postChangeIssuedToUnissuedFacility', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;
  let mockFacilitiesResponse;
  let mockUserResponse;
  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestIssuedToUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();
    mockFacilitiesResponse = MOCKS.MockFacilitiesResponse();
    mockUserResponse = MOCKS.MockUserResponse();

    api.getApplication.mockResolvedValue(MOCKS.MockApplicationResponseSubmitted());
    api.getUserDetails.mockResolvedValue(mockUserResponse);
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.getFacilities.mockResolvedValue(mockFacilitiesResponse);
    api.updateFacility.mockResolvedValue({});
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('posts and changes facility to unissued and returns correct url', async () => {
    mockRequest.body.hasBeenIssued = 'false';
    mockRequest.session.userToken = userToken;

    await postChangeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith({
      facilityId,
      payload: {
        coverEndDate: null,
        coverStartDate: null,
        issueDate: null,
        shouldCoverStartOnSubmission: null,
        monthsOfCover: 30,
        hasBeenIssued: false,
        canResubmitIssuedFacilities: false,
        coverDateConfirmed: false,
        unissuedToIssuedByMaker: {},
      },
      userToken,
    });
  });

  it('renders template with errors if no box is selected', async () => {
    mockRequest.body.hasBeenIssued = null;

    await postChangeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith(
      'partials/issued-facility-to-unissued.njk',
      expect.objectContaining({
        errors: {
          errorSummary: [
            {
              text: 'Select if your bank has already issued this cash facility',
              href: '#hasBeenIssued',
            },
          ],
          fieldErrors: {
            hasBeenIssued: { text: 'Select if your bank has already issued this cash facility' },
          },
        },
      }),
    );
    // should not go ahead with call as errors
    expect(api.updateFacility).not.toHaveBeenCalled();
  });

  it('should redirect to application details page and not update facility if hasBeenIssued is selected as true', async () => {
    mockRequest.body.hasBeenIssued = 'true';

    await postChangeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/1234567890abcdf123456789');
    expect(api.updateFacility).not.toHaveBeenCalled();
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.body.hasBeenIssued = 'false';

    api.updateFacility.mockRejectedValueOnce();
    await postChangeIssuedToUnissuedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('changeIssuedToUnissuedFacility()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

    api.getApplication.mockResolvedValue(MOCKS.MockApplicationResponseSubmitted());
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the template for a contingent facility', async () => {
    mockRequest.query.facilityType = CONSTANTS.FACILITY_TYPE.CONTINGENT;

    await changeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith(
      'partials/issued-facility-to-unissued.njk',
      expect.objectContaining({
        dealId: '1234567890abcdf123456789',
        facilityType: 'contingent',
        hasBeenIssued: 'true',
      }),
    );
  });

  it('renders the template for a cash facility', async () => {
    // cash comes through as null/undefined
    mockRequest.query.facilityType = null;

    await changeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith(
      'partials/issued-facility-to-unissued.njk',
      expect.objectContaining({
        dealId: '1234567890abcdf123456789',
        facilityType: 'cash',
        hasBeenIssued: 'true',
      }),
    );
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getFacility.mockRejectedValueOnce();
    await changeIssuedToUnissuedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
