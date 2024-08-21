import { add, sub, format } from 'date-fns';
import { validateAndUpdateAboutFacility } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const userToken = 'test-token';
const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.body = {};
  req.session = {
    user: {
      _id: '12345',
    },
    userToken,
  };
  req.params.dealId = '123';
  req.params.facilityId = 'xyz';
  return req;
};

const MockFacilityResponse = () => {
  const res = {};
  res.details = {
    type: CONSTANTS.FACILITY_TYPE.CASH,
    name: 'UKEF123',
    hasBeenIssued: true,
    monthsOfCover: null,
    coverStartDate: '2030-01-02T00:00:00.000+00:00',
    shouldCoverStartOnSubmission: true,
    coverEndDate: null,
  };
  return res;
};

describe('validateAndUpdateAboutFacility', () => {
  let mockResponse;
  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const yesterday = sub(now, { days: 1 });
  const threeMonthsAndOneDayFromNow = add(now, { months: 3, days: 1 });
  const oneDayLessThanThreeMonthsFromNow = sub(add(now, { months: 3 }), { days: 1 });

  const updateApplicationSpy = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    mockResponse = MockResponse();
    const mockFacilityResponse = MockFacilityResponse();

    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
    api.updateApplication = updateApplicationSpy;
  });

  describe.each([0, 1])('with deal version %s', (dealVersion) => {
    beforeEach(() => {
      api.getApplication.mockResolvedValue({ version: dealVersion });
    });

    it('redirects user to application page if save and return is set to true', async () => {
      const mockRequest = MockRequest();
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('sets the correct date format using single day, month and year values', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      if (dealVersion === 1) {
        mockRequest.body.isUsingFacilityEndDate = 'true';
      }

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      const expectedPayload = {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(now, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: null,
        name: undefined,
        coverDateConfirmed: null,
      };
      if (dealVersion === 1) {
        expectedPayload.isUsingFacilityEndDate = true;
        expectedPayload.facilityEndDate = null;
        expectedPayload.bankReviewDate = null;
      }
      expect(api.updateFacility).toHaveBeenCalledWith({
        facilityId: 'xyz',
        payload: expectedPayload,
        userToken,
      });
    });

    it('calls api.updateApplication with editorId if successfully updates facility when `saveAndReturn` true', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('calls api.updateApplication with editorId if successfully updates facility when `saveAndReturn` false', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.query.saveAndReturn = 'false';
      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');
      mockRequest.body.isUsingFacilityEndDate = 'false';

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('shows error message if month of cover is not a number', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.monthsOfCover = 'ab';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if no facility name has been provided', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'name';
      mockRequest.body.hasBeenIssued = 'true';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.not.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
          }),
        }),
      );

      mockRequest.body.facilityName = '';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if facility name is more than 30 characters', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'name';
      mockRequest.body.hasBeenIssued = 'true';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.not.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
          }),
        }),
      );

      mockRequest.body.facilityName = 'A string that is more than 30 characters in length to prove the point';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if facility name has disallowed characters', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'name .,;-';
      mockRequest.body.hasBeenIssued = 'true';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.not.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
          }),
        }),
      );

      mockRequest.body.facilityName = 'name .,;-   *';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if no shouldCoverStartOnSubmission radio button has been selected', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.not.arrayContaining([{ href: '#shouldCoverStartOnSubmission', text: expect.any(String) }]),
          }),
        }),
      );

      mockRequest.body.shouldCoverStartOnSubmission = '';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#shouldCoverStartOnSubmission', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if no coverStartDateDay or coverStartDateMonth or coverStartDateYear has been provided', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.not.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
          }),
        }),
      );

      mockRequest.body['cover-start-date-day'] = '';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
          }),
        }),
      );

      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = '';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate is more than 3 months away', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
      mockRequest.body['cover-start-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
      mockRequest.body['cover-start-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('does not show error message if coverStartDate is less than 3 months away', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(oneDayLessThanThreeMonthsFromNow, 'd');
      mockRequest.body['cover-start-date-month'] = format(oneDayLessThanThreeMonthsFromNow, 'M');
      mockRequest.body['cover-start-date-year'] = format(oneDayLessThanThreeMonthsFromNow, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.not.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate is in the past', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate day has character or is more than 3 numbers long', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = `${format(yesterday, 'd')}-`;
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The day for the cover start date must include 1 or 2 numbers' }]),
          }),
        }),
      );

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = `${format(yesterday, 'd')}2`;
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The day for the cover start date must include 1 or 2 numbers' }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate month has character or is more than 3 numbers long', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = `${format(yesterday, 'M')}=`;
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The month for the cover start date must include 1 or 2 numbers' }]),
          }),
        }),
      );

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = `${format(yesterday, 'M')}3}`;
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The month for the cover start date must include 1 or 2 numbers' }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate year is less than 4 numbers long or has symbols', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = `${format(yesterday, 'yyyy')}+`;

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The year for the cover start date must include 4 numbers' }]),
          }),
        }),
      );

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = '20';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The year for the cover start date must include 4 numbers' }]),
          }),
        }),
      );
    });

    it('shows error message if coverEndDate day has character or is more than 3 numbers long', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = `${format(yesterday, 'd')}-`;
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The day for the cover end date must include 1 or 2 numbers' }]),
          }),
        }),
      );

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = `${format(yesterday, 'd')}2`;
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The day for the cover end date must include 1 or 2 numbers' }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate month has character or is more than 3 numbers long', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = `${format(yesterday, 'M')}=`;
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The month for the cover end date must include 1 or 2 numbers' }]),
          }),
        }),
      );

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = `${format(yesterday, 'M')}3}`;
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The month for the cover end date must include 1 or 2 numbers' }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate year is less than 4 numbers long or has symbols', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = `${format(yesterday, 'yyyy')}+`;

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The year for the cover end date must include 4 numbers' }]),
          }),
        }),
      );

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = '20';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The year for the cover end date must include 4 numbers' }]),
          }),
        }),
      );
    });

    it('shows error message if coverStartDate is after coverEndDate is in the past', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');
      mockRequest.body['cover-end-date-day'] = format(now, 'd');
      mockRequest.body['cover-end-date-month'] = format(now, 'M');
      mockRequest.body['cover-end-date-year'] = format(now, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('should show error message if coverStartDate is the same as coverEndDate', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');
      mockRequest.body['cover-end-date-day'] = format(now, 'd');
      mockRequest.body['cover-end-date-month'] = format(now, 'M');
      mockRequest.body['cover-end-date-year'] = format(now, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('should show error message if cover starts on submission which is the same as the coverEndDate', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';
      mockRequest.body['cover-end-date-day'] = format(now, 'd');
      mockRequest.body['cover-end-date-month'] = format(now, 'M');
      mockRequest.body['cover-end-date-year'] = format(now, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The cover end date must be after the cover start date' }]),
          }),
        }),
      );
    });

    it('should show error message if cover starts on submission which is before the coverEndDate', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'Cover end date cannot be before cover start date' }]),
          }),
        }),
      );
    });

    it('shows error message if no monthsOfCover has been provided', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'false';
      mockRequest.body.monthsOfCover = '';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if monthsOfCover is not a number', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'false';
      mockRequest.body.monthsOfCover = '1ab';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if monthsOfCover is greater than 999 months', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'false';
      mockRequest.body.monthsOfCover = '1000';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      const mockRequest = MockRequest();
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      api.updateFacility.mockRejectedValueOnce();
      await validateAndUpdateAboutFacility(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('with deal version 1', () => {
    beforeEach(() => {
      api.getApplication.mockResolvedValue({ version: 1 });
    });

    it('shows error message if isUsingFacilityEndDate is not a boolean', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/about-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#isUsingFacilityEndDate', text: 'Select if there is an end date for this facility' }]),
          }),
        }),
      );
    });

    it('redirects user to facility end date page if using facility end date', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.facilityName = 'Name';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.monthsOfCover = '10';
      mockRequest.body['cover-end-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
      mockRequest.body['cover-end-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
      mockRequest.body['cover-end-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

      mockRequest.body.isUsingFacilityEndDate = 'true';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-end-date');
    });

    it('redirects user to bank review date page if not using facility end date', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.facilityName = 'Name';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.monthsOfCover = '10';
      mockRequest.body['cover-end-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
      mockRequest.body['cover-end-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
      mockRequest.body['cover-end-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

      mockRequest.body.isUsingFacilityEndDate = 'false';

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/bank-review-date');
    });
  });

  describe('with deal version 0', () => {
    beforeEach(() => {
      api.getApplication.mockResolvedValue({ version: 0 });
    });

    it('redirects user to provided facility page if all inputs are valid', async () => {
      const mockRequest = MockRequest();
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.facilityName = 'Name';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.monthsOfCover = '10';
      mockRequest.body['cover-end-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
      mockRequest.body['cover-end-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
      mockRequest.body['cover-end-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

      await validateAndUpdateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/provided-facility');
    });
  });
});
