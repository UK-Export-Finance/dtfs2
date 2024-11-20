import { FACILITY_PROVIDED_DETAILS } from '@ukef/dtfs2-common';
import { providedFacility, validateProvidedFacility } from './index';
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

const generateMockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.body = {};
  req.params.dealId = '123';
  req.params.facilityId = 'xyz';
  req.session = {
    user: {
      _id: '12345',
    },
    userToken,
  };
  return req;
};

const generateMockProvidedFacilityResponse = () => ({ details: { _id: 'xyz', type: CONSTANTS.FACILITY_TYPE.CASH } });
const generateMockApplicationResponse = () => ({ version: 1, _id: '123' });

describe('controllers/provided-facility', () => {
  let mockResponse;
  let mockRequest;
  let mockGetFacilityResponse;
  let mockGetApplicationResponse;
  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = generateMockRequest();
    mockGetFacilityResponse = generateMockProvidedFacilityResponse();
    mockGetApplicationResponse = generateMockApplicationResponse();

    api.getFacility.mockResolvedValue(mockGetFacilityResponse);
    api.getApplication.mockResolvedValueOnce(mockGetApplicationResponse);
    api.updateFacility.mockResolvedValue(mockGetFacilityResponse);
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Provided Facility', () => {
    it('renders the `Provided Facility` template', async () => {
      mockRequest.query.status = 'change';
      mockGetFacilityResponse.details.details = [FACILITY_PROVIDED_DETAILS.TERM, FACILITY_PROVIDED_DETAILS.RESOLVING];

      api.getFacility.mockResolvedValueOnce(mockGetFacilityResponse);

      await providedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          details: ['Term basis', 'Revolving or renewing basis'],
          facilityTypeString: 'cash',
          dealId: '123',
          facilityId: 'xyz',
          status: 'change',
        }),
      );
    });

    it('should return to the about facility page when clicking back on a v0 deal', async () => {
      // Arrange
      mockRequest.query.status = 'change';
      mockGetApplicationResponse.version = 0;
      api.getFacility.mockResolvedValueOnce(mockGetFacilityResponse);
      api.getApplication.mockResolvedValueOnce(mockGetApplicationResponse);

      // Act
      await providedFacility(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          previousPage: `/gef/application-details/${mockRequest.params.dealId}/facilities/${mockRequest.params.facilityId}/about-facility`,
        }),
      );
    });

    it('should return to the about facility page when clicking back on a v1 deal when isUsingFacilityEndDate null', async () => {
      // Arrange
      mockRequest.query.status = 'change';
      mockGetFacilityResponse.details.isUsingFacilityEndDate = null;
      mockGetApplicationResponse.version = 1;
      api.getFacility.mockResolvedValueOnce(mockGetFacilityResponse);
      api.getApplication.mockResolvedValueOnce(mockGetApplicationResponse);

      // Act
      await providedFacility(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          previousPage: `/gef/application-details/${mockRequest.params.dealId}/facilities/${mockRequest.params.facilityId}/about-facility`,
        }),
      );
    });

    it('should return to the about facility page when clicking back on a v1 deal when isUsingFacilityEndDate false', async () => {
      // Arrange
      mockRequest.query.status = 'change';
      mockGetFacilityResponse.details.isUsingFacilityEndDate = false;
      mockGetApplicationResponse.version = 1;
      api.getFacility.mockResolvedValueOnce(mockGetFacilityResponse);
      api.getApplication.mockResolvedValueOnce(mockGetApplicationResponse);

      // Act
      await providedFacility(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          previousPage: `/gef/application-details/${mockRequest.params.dealId}/facilities/${mockRequest.params.facilityId}/bank-review-date`,
        }),
      );
    });

    it('back link goes to the facility end date page if on a v1 deal & using facility end date', async () => {
      mockRequest.query.status = 'change';
      mockGetFacilityResponse.details.details = [FACILITY_PROVIDED_DETAILS.TERM, FACILITY_PROVIDED_DETAILS.RESOLVING];
      mockGetFacilityResponse.details.type = CONSTANTS.FACILITY_TYPE.CASH;
      mockGetFacilityResponse.details.isUsingFacilityEndDate = true;

      mockGetApplicationResponse.version = 1;

      api.getFacility.mockResolvedValueOnce(mockGetFacilityResponse);
      api.getApplication.mockResolvedValueOnce(mockGetApplicationResponse);

      await providedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          previousPage: `/gef/application-details/${mockRequest.params.dealId}/facilities/${mockRequest.params.facilityId}/facility-end-date`,
        }),
      );
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      api.getFacility.mockRejectedValueOnce();
      await providedFacility(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Provided Facility', () => {
    it('shows error message if nothing is set', async () => {
      await validateProvidedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#details', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('redirects user to application page if application page if save and return is set to true', async () => {
      mockRequest.query.saveAndReturn = 'true';

      await validateProvidedFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('redirects user to facility-currency page if application page if query status is equal to `change`', async () => {
      mockRequest.query.status = 'change';
      mockRequest.body.details = ['Term basis'];

      await validateProvidedFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-currency');
    });

    it('shows error message if Other textarea is left empty', async () => {
      mockRequest.body.details = 'Other';

      await validateProvidedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#detailsOther', text: expect.any(String) }]),
          }),
        }),
      );

      mockRequest.body.details = ['Other', 'Term basis'];

      await validateProvidedFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/provided-facility.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#detailsOther', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('calls the updateFacility api with the correct data', async () => {
      mockRequest.body.details = ['Term basis', 'Revolving or renewing basis'];

      await validateProvidedFacility(mockRequest, mockResponse);

      expect(api.updateFacility).toHaveBeenCalledWith({
        facilityId: 'xyz',
        payload: {
          details: ['Term basis', 'Revolving or renewing basis'],
          detailsOther: undefined,
        },
        userToken,
      });
    });

    it('calls api.updateApplication with editorId if successfully updates facility', async () => {
      mockRequest.body.details = ['TERMS', 'RESOLVING'];

      await validateProvidedFacility(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.body.details = ['Term basis'];
      api.updateFacility.mockRejectedValueOnce();
      await validateProvidedFacility(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
