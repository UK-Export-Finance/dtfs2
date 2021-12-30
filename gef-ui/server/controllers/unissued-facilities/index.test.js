import { add, format } from 'date-fns';
import {
  renderChangeFacilityPartial,
  changeUnissuedFacility,
  changeUnissuedFacilityPreview,
  postChangeUnissuedFacility,
  postChangeUnissuedFacilityPreview,
} from './index';
import api from '../../services/api';
import MOCKS from '../mocks/index';

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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const oneYearFromNow = add(now, { years: 1, months: 3, days: 1 });

  it('posts and returns correct message and url', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['issue-date-day'] = format(tomorrow, 'd');
    mockRequest.body['issue-date-month'] = format(tomorrow, 'M');
    mockRequest.body['issue-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    await postChangeUnissuedFacility(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith('xyz', {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(tomorrow, 'MMMM d, yyyy'),
      issueDate: format(tomorrow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    { message: 'Foundry4 is updated' },
    '/gef/application-details/123/unissued-facilities');
  });

  it('should not update facility if no name or dates', async () => {
    mockRequest.body.facilityType = 'CASH';
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
    expect(api.updateFacility).not.toHaveBeenCalledWith(MOCKS.MockRequestUnissued.facilityId, {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(oneYearFromNow, 'MMMM d, yyyy'),
      issueDate: format(tomorrow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    { message: 'Foundry4 is updated' },
    '/gef/application-details/123/unissued-facilities');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.facilityType = 'CASH';

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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const oneYearFromNow = add(now, { years: 1, months: 3, days: 1 });

  it('posts and returns correct url', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(tomorrow, 'd');
    mockRequest.body['issue-date-month'] = format(tomorrow, 'M');
    mockRequest.body['issue-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith('xyz', {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(tomorrow, 'MMMM d, yyyy'),
      issueDate: format(tomorrow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    '/gef/application-details/123');
  });

  it('should not update facility if no name or dates', async () => {
    mockRequest.body.facilityType = 'CASH';

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
    expect(api.updateFacility).not.toHaveBeenCalledWith('xyz', {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(oneYearFromNow, 'MMMM d, yyyy'),
      issueDate: format(tomorrow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    { message: 'Foundry4 is updated' },
    '/gef/application-details/123/unissued-facilities');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.facilityType = 'CASH';

    api.updateFacility.mockRejectedValueOnce();
    await postChangeUnissuedFacilityPreview(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
