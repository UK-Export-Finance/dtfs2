import { add, sub, format } from 'date-fns';
import { aboutFacility, validateAboutFacility } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.body = {};
  req.session = {
    user: {
      _id: '12345',
    },
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

describe('controllers/about-facility', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityResponse = MockFacilityResponse();

    api.getApplication.mockResolvedValue({});
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET About Facility', () => {
    it('renders the `About Facility` template', async () => {
      mockRequest.query.status = 'change';

      await aboutFacility(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        facilityType: CONSTANTS.FACILITY_TYPE.CASH,
        facilityName: 'UKEF123',
        hasBeenIssued: true,
        monthsOfCover: null,
        shouldCoverStartOnSubmission: 'true',
        coverStartDateDay: '2',
        coverStartDateMonth: '1',
        coverStartDateYear: '2030',
        coverEndDateMonth: null,
        coverEndDateYear: null,
        facilityTypeString: 'cash',
        dealId: '123',
        facilityId: 'xyz',
        status: 'change',
      }));
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      api.getFacility.mockRejectedValueOnce();
      await aboutFacility(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate About Facility', () => {
    const now = new Date();
    const tomorrow = add(now, { days: 1 });
    const yesterday = sub(now, { days: 1 });
    const threeMonthsAndOneDayFromNow = add(now, { months: 3, days: 1 });
    const oneDayoneDayLessThanThreeMonthsFromNow = sub(add(now, { months: 3 }), { days: 1 });

    it('redirects user to application page if save and return is set to true', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('sets the correct date format using single day, month and year values', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(api.updateFacility).toHaveBeenCalledWith('xyz', {
        coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
        coverStartDate: format(now, 'MMMM d, yyyy'),
        shouldCoverStartOnSubmission: null,
        monthsOfCover: null,
        name: undefined,
        coverDateConfirmed: null,
      });
    });

    it('calls api.updateApplication with editorId if successfully updates facility', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

      mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith(mockRequest.params.dealId, expectedUpdateObj);
    });

    it('shows error message if month of cover is not a number', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.monthsOfCover = 'ab';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if no facility name has been provided', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'name';
      mockRequest.body.hasBeenIssued = 'true';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
        }),
      }));

      mockRequest.body.facilityName = '';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if facility name is more than 30 characters', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'name';
      mockRequest.body.hasBeenIssued = 'true';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
        }),
      }));

      mockRequest.body.facilityName = 'A string that is more than 30 characters in length to prove the point';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if facility name has disallowed characters', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.facilityName = 'name .,;-';
      mockRequest.body.hasBeenIssued = 'true';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
        }),
      }));

      mockRequest.body.facilityName = 'name .,;-   *';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#facilityName', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if no shouldCoverStartOnSubmission radio button has been selected', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#shouldCoverStartOnSubmission', text: expect.any(String) }]),
        }),
      }));

      mockRequest.body.shouldCoverStartOnSubmission = '';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#shouldCoverStartOnSubmission', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if no coverStartDateDay or coverStartDateMonth or coverStartDateYear has been provided', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
        }),
      }));

      mockRequest.body['cover-start-date-day'] = '';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
        }),
      }));

      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = '';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if coverStartDate is more than 3 months away', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
      mockRequest.body['cover-start-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
      mockRequest.body['cover-start-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
        }),
      }));
    });

    it('doesnt show error message if coverStartDate is less than 3 months away', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(oneDayoneDayLessThanThreeMonthsFromNow, 'd');
      mockRequest.body['cover-start-date-month'] = format(oneDayoneDayLessThanThreeMonthsFromNow, 'M');
      mockRequest.body['cover-start-date-year'] = format(oneDayoneDayLessThanThreeMonthsFromNow, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if coverStartDate is in the past', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if coverStartDate day has character or is more than 3 numbers long', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = `${format(yesterday, 'd')}-`;
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The day for the cover start date must include 1 or 2 numbers' }]),
        }),
      }));

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = `${format(yesterday, 'd')}2`;
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The day for the cover start date must include 1 or 2 numbers' }]),
        }),
      }));
    });

    it('shows error message if coverStartDate month has character or is more than 3 numbers long', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = `${format(yesterday, 'M')}=`;
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The month for the cover start date must include 1 or 2 numbers' }]),
        }),
      }));

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = `${format(yesterday, 'M')}3}`;
      mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The month for the cover start date must include 1 or 2 numbers' }]),
        }),
      }));
    });

    it('shows error message if coverStartDate year is less than 4 numbers long or has symbols', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = `${format(yesterday, 'yyyy')}+`;

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The year for the cover start date must include 4 numbers' }]),
        }),
      }));

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-start-date-year'] = '20';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverStartDate', text: 'The year for the cover start date must include 4 numbers' }]),
        }),
      }));
    });

    it('shows error message if coverEndDate day has character or is more than 3 numbers long', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = `${format(yesterday, 'd')}-`;
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The day for the cover end date must include 1 or 2 numbers' }]),
        }),
      }));

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = `${format(yesterday, 'd')}2`;
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The day for the cover end date must include 1 or 2 numbers' }]),
        }),
      }));
    });

    it('shows error message if coverStartDate month has character or is more than 3 numbers long', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = `${format(yesterday, 'M')}=`;
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The month for the cover end date must include 1 or 2 numbers' }]),
        }),
      }));

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = `${format(yesterday, 'M')}3}`;
      mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The month for the cover end date must include 1 or 2 numbers' }]),
        }),
      }));
    });

    it('shows error message if coverStartDate year is less than 4 numbers long or has symbols', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = `${format(yesterday, 'yyyy')}+`;

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The year for the cover end date must include 4 numbers' }]),
        }),
      }));

      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
      mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
      mockRequest.body['cover-end-date-year'] = '20';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: 'The year for the cover end date must include 4 numbers' }]),
        }),
      }));
    });

    it('shows error message if coverStartDate is after coverEndDate is in the past', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
      mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
      mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');
      mockRequest.body['cover-end-date-day'] = format(now, 'd');
      mockRequest.body['cover-end-date-month'] = format(now, 'M');
      mockRequest.body['cover-end-date-year'] = format(now, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: expect.any(String) }]),
        }),
      }));
    });

    it('should show error message if coverStartDate is the same as coverEndDate', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.shouldCoverStartOnSubmission = 'false';
      mockRequest.body['cover-start-date-day'] = format(now, 'd');
      mockRequest.body['cover-start-date-month'] = format(now, 'M');
      mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');
      mockRequest.body['cover-end-date-day'] = format(now, 'd');
      mockRequest.body['cover-end-date-month'] = format(now, 'M');
      mockRequest.body['cover-end-date-year'] = format(now, 'yyyy');

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#coverEndDate', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if no monthsOfcover has been provided', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'false';
      mockRequest.body.monthsOfCover = '';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if monthsOfcover is not a number', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'false';
      mockRequest.body.monthsOfCover = '1ab';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
        }),
      }));
    });

    it('shows error message if monthsOfcover is greater than 999 months', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'false';
      mockRequest.body.monthsOfCover = '1000';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
        }),
      }));
    });

    it('redirects user to provided facility page if all of method passes', async () => {
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.facilityName = 'Name';
      mockRequest.body.shouldCoverStartOnSubmission = 'true';
      mockRequest.body.hasBeenIssued = 'true';
      mockRequest.body.monthsOfCover = '10';
      mockRequest.body['cover-start-date-day'] = '01';
      mockRequest.body['cover-start-date-month'] = '05';
      mockRequest.body['cover-start-date-year'] = '2022';
      mockRequest.body['cover-end-date-day'] = '05';
      mockRequest.body['cover-end-date-month'] = '12';
      mockRequest.body['cover-end-date-year'] = '2023';

      await validateAboutFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/provided-facility');
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;

      api.updateFacility.mockRejectedValueOnce();
      await validateAboutFacility(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
