import applicationDetails from './index';
import * as api from '../../services/api';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.params.applicationId = '123';
  return req;
};

const MockApplicationResponse = () => {
  const res = {};
  res.exporterId = '123';
  return res;
};

const MockExporterResponse = () => {
  const res = {};
  res.details = {};
  res.status = 1;
  res.validation = {};
  res.details.companiesHouseRegistrationNumber = 'tedsi';
  res.validation.required = [];
  return res;
};

const MockFacilityResponse = () => {
  const res = {};
  res.status = 1;
  res.items = [];
  return res;
};

const mockResponse = new MockResponse();
const mockRequest = new MockRequest();
const mockApplicationResponse = new MockApplicationResponse();
const mockExporterResponse = new MockExporterResponse();
const mockFacilityResponse = new MockFacilityResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Application Details', () => {
  it('renders the `Application Details` template', async () => {
    mockFacilityResponse.items = [{ details: { type: 1 }, validation: { required: [] } }];
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
      exporter: {
        status: expect.any(Object),
        rows: expect.any(Array),
      },
      facilities: {
        status: expect.any(Object),
        items: [
          {
            heading: expect.any(String),
            rows: expect.any(Array),
          },
        ],
      },
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getApplication = () => Promise.reject();
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
