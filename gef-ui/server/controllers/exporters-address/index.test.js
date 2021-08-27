import { exportersAddress, validateExportersAddress } from './index';
import api from '../../services/api';

jest.mock('../../services/api');

const postcode = 'EE1 1EE';
const companyName = 'Test Company';
const registeredAddress = { addressLine1: 'line 1', addressLine2: 'line 2' };

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.params.applicationId = '123';
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
  res.params = {};
  res.params.exporterId = 'abc';
  return res;
};

const MockExporterResponse = () => {
  const res = {};
  res.details = {
    companyName,
    registeredAddress,
  };
  return res;
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('controllers/excorters-address', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockExporterResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();
    mockExporterResponse = MockExporterResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getExporter.mockResolvedValue(mockExporterResponse);
    api.updateExporter.mockResolvedValue({});
    api.getAddressesByPostcode.mockResolvedValue([{ addressLine1: 'line 1', addressLine2: 'line 2' }]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Exporters Address', () => {
    it('renders the `exporters-address` template', async () => {
      mockExporterResponse.details.companyName = 'Test company';
      mockExporterResponse.details.registeredAddress = { line1: 'Line 1', line2: 'Line 2' };
      api.getExporter.mockResolvedValueOnce(mockExporterResponse);

      await exportersAddress(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        applicationId: '123',
        companyName: 'Test company',
        registeredAddress: expect.any(Object),
      });
    });

    it('renders the `exporters-address` template without registered address', async () => {
      mockExporterResponse.details.companyName = 'Test company';
      mockExporterResponse.details.registeredAddress = null;
      api.getExporter.mockResolvedValueOnce(mockExporterResponse);

      await exportersAddress(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
        applicationId: '123',
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
    it('returns error object if radio button hasnt been selected', async () => {
      mockRequest.body.correspondence = '';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', expect.objectContaining({
        companyName,
        correspondence: '',
        errors: expect.any(Object),
        postcode: '',
        registeredAddress,
      }));
    });

    it('redirects user to `about exporter` page if user selects `false` from the radio buttons', async () => {
      mockRequest.body.correspondence = 'false';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('about-exporter');
    });

    it('returns postcode error if postcode hasnt been entered', async () => {
      mockRequest.body.correspondence = 'true';

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', expect.objectContaining({
        companyName,
        errors: expect.any(Object),
        correspondence: 'true',
        registeredAddress,
      }));
    });

    it('fetchs addresses if there are currently no validation errors and stores them as a string in session storage', async () => {
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

      api.getAddressesByPostcode.mockRejectedValueOnce({ status: 422, data: [{ errMsg: 'Message', errRef: 'Reference' }] });

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', expect.objectContaining({
        companyName,
        errors: expect.any(Object),
        correspondence: 'true',
        registeredAddress,
        applicationId: mockRequest.params.applicationId,
      }));
    });

    it('shows user an error, allowing retry, if there is an issue with the address api', async () => {
      const expectedMsg = 'Error looking up postcode. Try again.';
      const correspondence = 'true';

      mockRequest.body.correspondence = correspondence;
      mockRequest.body.postcode = postcode;
      mockExporterResponse.details.companyName = companyName;

      api.getAddressesByPostcode.mockRejectedValueOnce({ response: { status: 500, message: 'Whoops' } });

      await validateExportersAddress(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/exporters-address.njk',
        {
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
          registeredAddress,
          correspondence,
          applicationId: mockRequest.params.applicationId,
        },
      );
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      api.getApplication.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await validateExportersAddress({}, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
