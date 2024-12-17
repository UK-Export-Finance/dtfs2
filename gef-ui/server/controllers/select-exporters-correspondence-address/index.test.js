import { selectExportersCorrespondenceAddress, validateSelectExportersCorrespondenceAddress } from './index';
import api from '../../services/api';

jest.mock('../../services/api');

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.params.dealId = '123';
  req.session = {};
  req.body = {};
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockApplicationResponse = () => {
  const res = {};
  return res;
};

describe('controllers/select-exporters-correspondence-address', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Select Exporters Correspondence Address', () => {
    it('should render the `select-exporters-correspondence-address` template', async () => {
      mockRequest.session.postcode = 'W1 7PD';
      mockRequest.session.addresses = JSON.stringify([{ addressLine1: 'line1' }]);

      await selectExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/select-exporters-correspondence-address.njk', {
        postcode: 'W1 7PD',
        dealId: '123',
        addressesForSelection: [
          {
            text: '1 Address Found',
          },
          {
            text: 'line1',
            value: 0,
          },
        ],
      });
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      api.getApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await selectExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Select Exporters Correspondence Address', () => {
    beforeEach(() => {
      mockRequest.session.postcode = 'W1 7PD';
      mockRequest.session.addresses = JSON.stringify([{ addressLine1: 'line1' }]);
    });

    it('should return an error object if address from select dropdown has not been selected', async () => {
      mockRequest.body.selectedAddress = '';

      await validateSelectExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/select-exporters-correspondence-address.njk',
        expect.objectContaining({
          errors: expect.any(Object),
          dealId: '123',
        }),
      );
    });

    it('should return an error object if address from select dropdown contains `Addresses Found`', async () => {
      mockRequest.body.selectedAddress = 'Addresses Found';

      await validateSelectExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/select-exporters-correspondence-address.njk',
        expect.objectContaining({
          errors: expect.any(Object),
          dealId: '123',
        }),
      );
    });

    it('should add the address object into session string', async () => {
      mockRequest.body.selectedAddress = '0';

      await validateSelectExportersCorrespondenceAddress(mockRequest, mockResponse);

      const expected = JSON.stringify({ addressLine1: 'line1' });

      expect(mockRequest.session.address).toEqual(expected);
    });

    it('should redirect to `enter-exporters-correspondence-address` page if successful', async () => {
      mockRequest.body.selectedAddress = '0';

      await validateSelectExportersCorrespondenceAddress(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/enter-exporters-correspondence-address');
    });
  });
});
