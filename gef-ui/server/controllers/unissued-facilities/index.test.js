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

describe('renderChangeFacilityPartial()', () => {
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

    api.getApplication.mockResolvedValue(MOCKS.MockApplicationResponseSubmitted());
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns an object with expected parameters for changeUnissuedFacility', async () => {
    mockRequest.query.status = 'change';

    const result = await renderChangeFacilityPartial(mockRequest.params, mockRequest.query, true);

    const expected = MOCKS.MockExpectedFacilityRenderChange(true);

    expect(result).toEqual(expected);
  });

  it('returns an object with expected parameters for changeUnissuedFacilityPreview', async () => {
    mockRequest.query.status = 'change';
    const result = await renderChangeFacilityPartial(mockRequest.params, mockRequest.query, false);

    const expected = MOCKS.MockExpectedFacilityRenderChange(false);

    expect(result).toEqual(expected);
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

    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      change: false,
    }));
  });

  it('changeUnissuedFacility should not call renderChangeFacilityPartial with true', async () => {
    mockRequest.query.status = 'change';

    await changeUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      change: true,
    }));
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

    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      change: true,
    }));
  });

  it('changeUnissuedFacilityPreview should not call renderChangeFacilityPartial with false', async () => {
    mockRequest.query.status = 'change';

    await changeUnissuedFacilityPreview(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      change: false,
    }));
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
    mockApplicationResponse = MOCKS.MockApplicationResponseSubmitted();
    mockUserResponse = MOCKS.MockUserResponse();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();
    mockFacilitiesResponse = MOCKS.MockFacilitiesResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
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
  const yesterday = sub(now, { days: 1 });
  const twoDaysAgo = sub(now, { days: 2 });
  const twoDaysAgoMidnight = (new Date(twoDaysAgo)).setHours(0, 0, 0, 0);
  const oneYearFromNow = add(now, { years: 1, months: 3, days: 1 });

  const maker = {
    _id: '12345',
    firstname: 'Test',
    surname: 'Test',
  };

  it('posts and returns correct message and url', async () => {
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

    await postChangeUnissuedFacility(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith(
      'xyz',
      {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(tomorrow, 'MMMM d, yyyy'),
        issueDate: format(now, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: 30,
        name: 'UKEF123',
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
        unissuedToIssuedByMaker: maker,
      },
      { message: 'UKEF123 is updated' },
      '/gef/application-details/123/unissued-facilities',
    );
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

    await postChangeUnissuedFacility(mockRequest, mockResponse);

    const expectedUpdateObj = {
      editorId: '12345',
    };

    expect(updateApplicationSpy).toHaveBeenCalledWith(mockRequest.params.dealId, expectedUpdateObj);
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

    await postChangeUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      errors: {
        errorSummary: [
          {
            text: 'The issue date must not be before the date of the inclusion notice submission date',
            href: '#issueDate',
          }],
        fieldErrors: {
          issueDate: { text: 'The issue date must not be before the date of the inclusion notice submission date' },
        },
      },
    }));

    // should not go ahead with call as errors
    expect(api.updateFacility).not.toHaveBeenCalledWith(
      MOCKS.MockRequestUnissued.facilityId,
      {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(twoDaysAgoMidnight, 'MMMM d, yyyy'),
        issueDate: format(twoDaysAgoMidnight, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: 30,
        name: 'UKEF123',
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
      },
      { message: 'UKEF123 is updated' },
      '/gef/application-details/123/unissued-facilities',
    );
  });

  it('posts and returns correct message and url if submission date in past and issue date on same day of submission', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.query.saveAndReturn = 'true';
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

    expect(api.updateFacility).toHaveBeenCalledWith(
      'xyz',
      {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(yesterday, 'MMMM d, yyyy'),
        issueDate: format(yesterday, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: 30,
        name: 'UKEF123',
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
        unissuedToIssuedByMaker: maker,
      },
      { message: 'UKEF123 is updated' },
      '/gef/application-details/123/unissued-facilities',
    );
  });

  it('should not update facility if no name or dates', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityId = 'xyz';

    await postChangeUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
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
    }));

    // should not go ahead with call as errors
    expect(api.updateFacility).not.toHaveBeenCalledWith(
      MOCKS.MockRequestUnissued.facilityId,
      {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(oneYearFromNow, 'MMMM d, yyyy'),
        issueDate: format(tomorrow, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: 30,
        name: 'UKEF123',
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
      },
      { message: 'UKEF123 is updated' },
      '/gef/application-details/123/unissued-facilities',
    );
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

    api.updateFacility.mockRejectedValueOnce();
    await postChangeUnissuedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
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

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const oneYearFromNow = add(now, { years: 1, months: 3, days: 1 });

  const maker = {
    _id: '12345',
    firstname: 'Test',
    surname: 'Test',
  };

  it('posts and returns correct url', async () => {
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

    await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith(
      'xyz',
      {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(tomorrow, 'MMMM d, yyyy'),
        issueDate: format(now, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: 30,
        name: 'UKEF123',
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
        unissuedToIssuedByMaker: maker,
      },
      '/gef/application-details/123',
    );
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

    await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);

    const expectedUpdateObj = {
      editorId: '12345',
    };

    expect(updateApplicationSpy).toHaveBeenCalledWith(mockRequest.params.dealId, expectedUpdateObj);
  });

  it('should not update facility if no name or dates', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

    await postChangeUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
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
    }));
    // should not go ahead with call as errors
    expect(api.updateFacility).not.toHaveBeenCalledWith(
      'xyz',
      {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(oneYearFromNow, 'MMMM d, yyyy'),
        issueDate: format(tomorrow, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: null,
        name: 'UKEF123',
        hasBeenIssued: true,
        canResubmitIssuedFacilities: true,
        coverDateConfirmed: true,
      },
      { message: 'UKEF123 is updated' },
      '/gef/application-details/123/unissued-facilities',
    );
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

    api.updateFacility.mockRejectedValueOnce();
    await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
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

    await postChangeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith(
      'xyz',
      {
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
      '/gef/application-details/123',
    );
  });

  it('renders template with errors if no box is selected', async () => {
    mockRequest.body.hasBeenIssued = null;

    await postChangeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/issued-facility-to-unissued.njk', expect.objectContaining({
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
    }));
    // should not go ahead with call as errors
    expect(api.updateFacility).not.toHaveBeenCalledWith(
      'xyz',
      {
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
      '/gef/application-details/123',
    );
  });

  it('should redirect to application details page and not update facility if hasBeenIssued is selected as true', async () => {
    mockRequest.body.hasBeenIssued = 'true';

    await postChangeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');

    expect(api.updateFacility).not.toHaveBeenCalledWith(
      'xyz',
      {
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
      '/gef/application-details/123',
    );
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

    expect(mockResponse.render).toHaveBeenCalledWith('partials/issued-facility-to-unissued.njk', expect.objectContaining({
      dealId: '123',
      facilityType: 'contingent',
      hasBeenIssued: 'true',
    }));
  });

  it('renders the template for a cash facility', async () => {
    // cash comes through as null/undefined
    mockRequest.query.facilityType = null;

    await changeIssuedToUnissuedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/issued-facility-to-unissued.njk', expect.objectContaining({
      dealId: '123',
      facilityType: 'cash',
      hasBeenIssued: 'true',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getFacility.mockRejectedValueOnce();
    await changeIssuedToUnissuedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
