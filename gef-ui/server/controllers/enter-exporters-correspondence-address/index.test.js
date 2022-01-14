import { enterExportersCorrespondenceAddress, validateEnterExportersCorrespondenceAddress } from './index';
import api from '../../services/api';
import { DEFAULT_COUNTRY } from '../../constants';

jest.mock('../../services/api');

const MockRequest = () => {
  const req = {};
  req.query = {};
  req.params = {};
  req.params.dealId = '123';
  req.session = {};
  req.body = {};
  req.get = () => '/url';
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockApplicationResponse = () => {
  const res = {
    _id: '123',
    exporter: {},
  };
  res.params = {};
  return res;
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('controllers/enter-exporters-correspondence-address', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.updateApplication.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Enter Exporters Correspondence Address', () => {
    it('renders the `enter-exporters-correspondence-address` template with empty field', async () => {
      await enterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', {
        addressForm: {},
        dealId: '123',
        backUrl: '/gef/application-details/123',
      });
    });

    it('renders the `enter-exporters-correspondence-address` template with data from address session', async () => {
      mockRequest.session.address = JSON.stringify({ addressLine1: 'line1', addressLine2: 'line2' });
      await enterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', {
        addressForm: {
          addressLine1: 'line1',
          addressLine2: 'line2',
          addressLine3: undefined,
          locality: undefined,
          organisationName: undefined,
          postalCode: undefined,
        },
        dealId: '123',
        backUrl: '/gef/application-details/123',
      });
    });

    it('renders the `enter-exporters-correspondence-address` template with data from exporter api', async () => {
      mockApplicationResponse.exporter.correspondenceAddress = { addressLine1: 'LINE1', addressLine2: 'LINE2' };
      await enterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', {
        addressForm: {
          addressLine1: 'LINE1',
          addressLine2: 'LINE2',
        },
        dealId: '123',
        backUrl: '/gef/application-details/123',
      });
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      const mockedRejection = { response: { status: 400, message: 'Whoops' } };
      api.getApplication.mockRejectedValueOnce(mockedRejection);

      await enterExportersCorrespondenceAddress(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Enter Exporters Correspondence Address', () => {
    it('returns error object if address line 1 field is empty', async () => {
      mockRequest.body.addressLine1 = '';
      mockRequest.body.postalCode = '';

      await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', expect.objectContaining({
        errors: expect.any(Object),
        dealId: '123',
        addressForm: { addressLine1: '', postalCode: '' },
      }));
    });

    it('returns error object if postcode field is empty', async () => {
      mockRequest.body.addressLine1 = 'Line1';
      mockRequest.body.postalCode = '';

      await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', expect.objectContaining({
        errors: expect.any(Object),
        dealId: '123',
        addressForm: { addressLine1: 'Line1', postalCode: '' },
      }));
    });

    it(`calls api with country defaulted to ${DEFAULT_COUNTRY}`, async () => {
      mockRequest.body.addressLine1 = 'Line1';
      mockRequest.body.postalCode = 'sa1 7fr';

      await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

      const expectedBody = {
        exporter: {
          correspondenceAddress: {
            ...mockRequest.body,
            country: DEFAULT_COUNTRY,
          },
        },
      };

      expect(api.updateApplication).toHaveBeenCalledWith(
        mockApplicationResponse._id,
        expectedBody,
      );
    });

    it('redirects user to `about exporter` page if response from api is successful', async () => {
      mockRequest.body.addressLine1 = 'Line1';
      mockRequest.body.postalCode = 'sa1 7fr';

      await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockRequest.session.address).toEqual(null);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/about-exporter');
    });

    it('redirects user to `application details` page if response from api is successful and saveToReturn query is set to true', async () => {
      mockRequest.body.addressLine1 = 'Line1';
      mockRequest.body.postalCode = 'sa1 7fr';
      mockRequest.query.saveAndReturn = 'true';

      await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('redirects user to `application details` page if response from api is successful and status query is set to `change`', async () => {
      mockRequest.body.addressLine1 = 'Line1';
      mockRequest.body.postalCode = 'sa1 7fr';
      mockRequest.query.status = 'change';

      await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      mockRequest.body.addressLine1 = 'Line1';
      mockRequest.body.postalCode = 'sa1 7fr';

      api.getApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
