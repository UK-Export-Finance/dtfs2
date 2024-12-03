import { exportersAddress, validateExportersAddress } from './index';
import api from '../../services/api';

jest.mock('../../services/api');

const postcode = 'EE1 1EE';
const companyName = 'Test Company';

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
  const res = {
    exporter: {},
  };
  res.params = {};
  return res;
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('controllers/excorters-address', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.updateApplication.mockResolvedValue({});
    api.getAddressesByPostcode.mockResolvedValue([{ addressLine1: 'line 1', addressLine2: 'line 2' }]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Exporters Address', () => {
    it('renders the `exporters-address` template', async () => {
      mockApplicationResponse.exporter.companyName = 'Test company';
      mockApplicationResponse.exporter.registeredAddress = { line1: 'Line 1', line2: 'Line 2' };
      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

      await exportersAddress(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        dealId: '123',
        companyName: 'Test company',
        registeredAddress: expect.any(Object),
      });
    });

    it('renders the `exporters-address` template without registered address', async () => {
      mockApplicationResponse.exporter.companyName = 'Test company';
      mockApplicationResponse.exporter.registeredAddress = null;
      api.getApplication.mockResolvedValueOnce(mockApplicationResponse);

      await exportersAddress(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        dealId: '123',
        companyName: 'Test company',
        registeredAddress: null,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the api', async () => {
      api.getApplication.mockRejectedValue({ response: { status: 400, message: 'Whoops' } });

      await exportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Exporters Address', () => {
    it('returns error object if radio button has not been selected', async () => {
      mockRequest.body.correspondence = '';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        dealId: '123',
        errors: {
          errorSummary: [
            {
              href: '#correspondence',
              text: 'Select whether there’s a separate correspondence address for the exporter',
            },
          ],
          fieldErrors: {
            correspondence: {
              text: 'Select whether there’s a separate correspondence address for the exporter',
            },
          },
        },
        companyName: '',
        correspondence: '',
        postcode: '',
      });
    });

    it('redirects user to `about exporter` page if user selects `false` from the radio buttons', async () => {
      mockRequest.body.correspondence = 'false';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('about-exporter');
    });

    it('returns postcode error if postcode has not been entered', async () => {
      mockRequest.body.correspondence = 'true';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        dealId: '123',
        errors: {
          errorSummary: [
            {
              href: '#postcode',
              text: 'Enter a postcode',
            },
          ],
          fieldErrors: {
            postcode: {
              text: 'Enter a postcode',
            },
          },
        },
        correspondence: 'true',
        postcode: '',
        companyName: '',
      });
    });

    it('fetches addresses if there are currently no validation errors and stores them as a string in session storage', async () => {
      mockRequest.body.correspondence = 'true';
      mockRequest.body.postcode = 'w1';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockRequest.session.addresses).toEqual(JSON.stringify([{ addressLine1: 'line 1', addressLine2: 'line 2' }]));
    });

    it('saves postcode to session storage in uppercase format', async () => {
      mockRequest.body.correspondence = 'true';
      mockRequest.body.postcode = 'sa2 tyw';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockRequest.session.postcode).toEqual('SA2 TYW');
    });

    it('returns validation errors from getAddressesByPostcode API', async () => {
      mockRequest.body.correspondence = 'true';
      mockRequest.body.postcode = postcode;

      api.getAddressesByPostcode.mockRejectedValueOnce({
        status: 422,
        data: [{ errMsg: 'Message', errRef: 'Reference' }],
      });

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        companyName: '',
        errors: {
          errorSummary: [
            {
              text: 'Error looking up postcode. Try again.',
              href: '#postcode',
            },
          ],
          fieldErrors: {
            postcode: {
              text: 'Error looking up postcode. Try again.',
            },
          },
        },
        correspondence: 'true',
        postcode,
        dealId: mockRequest.params.dealId,
      });
    });

    it('shows user an error, allowing retry, if there is an issue with the address api', async () => {
      const expectedMsg = 'Error looking up postcode. Try again.';
      const correspondence = 'true';

      mockRequest.body.correspondence = correspondence;
      mockRequest.body.postcode = postcode;
      mockApplicationResponse.exporter.companyName = companyName;

      api.getAddressesByPostcode.mockRejectedValueOnce({ response: { status: 500, message: 'Whoops' } });

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        errors: {
          errorSummary: [
            {
              text: expectedMsg,
              href: '#postcode',
            },
          ],
          fieldErrors: {
            postcode: {
              text: expectedMsg,
            },
          },
        },
        companyName,
        postcode,
        correspondence,
        dealId: mockRequest.params.dealId,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      api.getApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await validateExportersAddress({}, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
