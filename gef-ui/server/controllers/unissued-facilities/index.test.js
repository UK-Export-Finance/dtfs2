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

    api.getApplication.mockResolvedValue({});
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns an object with expected parameters for changeUnissuedFacility', async () => {
    mockRequest.query.status = 'change';

    const result = await renderChangeFacilityPartial(mockRequest.params, mockRequest.query, true);

    const expected = {
      facilityType: 'CASH',
      facilityName: 'Foundry4',
      hasBeenIssued: true,
      monthsOfCover: null,
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
      dealId: '123',
      facilityId: 'xyz',
      status: 'change',
      change: true,
    };

    expect(result).toEqual(expected);
  });

  it('returns an object with expected parameters for changeUnissuedFacilityPreview', async () => {
    mockRequest.query.status = 'change';
    const result = await renderChangeFacilityPartial(mockRequest.params, mockRequest.query, false);

    const expected = {
      facilityType: 'CASH',
      facilityName: 'Foundry4',
      hasBeenIssued: true,
      monthsOfCover: null,
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
      dealId: '123',
      facilityId: 'xyz',
      status: 'change',
      change: false,
    };

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

    api.getApplication.mockResolvedValue({});
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

    api.getApplication.mockResolvedValue({});
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
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

    api.getApplication.mockResolvedValue({});
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const threeMonthsAndOneDayFromNow = add(now, { months: 3, days: 1 });
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

  it('should not update facility if incorrect start and end dates', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(tomorrow, 'd');
    mockRequest.body['issue-date-month'] = format(tomorrow, 'M');
    mockRequest.body['issue-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
    mockRequest.body['cover-start-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
    mockRequest.body['cover-start-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    await postChangeUnissuedFacility(mockRequest, mockResponse);
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
    await postChangeUnissuedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('postChangeUnissuedFacilityPreview()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

    api.getApplication.mockResolvedValue({});
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const threeMonthsAndOneDayFromNow = add(now, { months: 3, days: 1 });
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

  it('should not update facility if incorrect start and end dates', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(tomorrow, 'd');
    mockRequest.body['issue-date-month'] = format(tomorrow, 'M');
    mockRequest.body['issue-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
    mockRequest.body['cover-start-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
    mockRequest.body['cover-start-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    await postChangeUnissuedFacility(mockRequest, mockResponse);
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
