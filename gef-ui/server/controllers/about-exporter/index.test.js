import { aboutExporter, validateAboutExporter } from './index';
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
  req.query = {};
  req.body = {};
  req.params.applicationId = '123';
  return req;
};

const MockAboutExporterResponse = () => {
  const res = {};
  res.details = {
    industries: null,
    smeType: null,
    probabilityOfDefault: null,
    selectedIndustry: null,
    isFinanceIncreasing: null,
  };
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET About Exporter', () => {
  it('renders the `About Exporter` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutExporterResponse = new MockAboutExporterResponse();

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await aboutExporter(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      industries: null,
      smeType: null,
      probabilityOfDefault: null,
      selectedIndustry: null,
      isFinanceIncreasing: null,
      applicationId: '123',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getApplication = () => Promise.reject();
    await aboutExporter(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate About Exporter', () => {
  it('returns no validation errors if `save and return` is set to true', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutExporterResponse = new MockAboutExporterResponse();
    mockRequest.query.saveAndReturn = 'true';

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await aboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      industries: null,
      smeType: null,
      status: undefined,
      probabilityOfDefault: null,
      isFinanceIncreasing: null,
      applicationId: '123',
    }));
  });

  it('returns validation error object if no `save and return` query is set', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutExporterResponse = new MockAboutExporterResponse();

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await validateAboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      errors: expect.any(Object),
      industries: null,
      smeType: undefined,
      probabilityOfDefault: undefined,
      isFinanceIncreasing: undefined,
      applicationId: '123',
    }));
  });

  it('returns Selected Industry validation error only if there are more than 1 industries', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutExporterResponse = new MockAboutExporterResponse();

    mockRequest.body.selectedIndustry = '';
    mockAboutExporterResponse.details.industries = [{
      name: 'name',
      class: {
        name: 'class name',
      },
    },
    {
      name: 'name',
      class: {
        name: 'class name',
      },
    }];

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await validateAboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#selectedIndustry', text: expect.any(String) }]),
      }),
      selectedIndustry: null,
      industries: expect.any(Array),
      smeType: undefined,
      probabilityOfDefault: undefined,
      isFinanceIncreasing: undefined,
      applicationId: '123',
    }));

    mockAboutExporterResponse.details.industries = [{
      name: 'name',
      class: {
        name: 'class name',
      },
    }];

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await validateAboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.not.arrayContaining([{ href: '#selectedIndustry', text: expect.any(String) }]),
      }),
    }));
  });

  it('returns percentage error if non percentage value is entered', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutExporterResponse = new MockAboutExporterResponse();

    mockRequest.body.probabilityOfDefault = '123';

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await validateAboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
      }),
      industries: null,
      smeType: undefined,
      probabilityOfDefault: '123',
      isFinanceIncreasing: undefined,
      selectedIndustry: null,
      applicationId: '123',
    }));

    mockRequest.body.probabilityOfDefault = -10;

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await validateAboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
      }),
    }));

    mockRequest.body.probabilityOfDefault = 10.2;

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await validateAboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
      }),
    }));

    mockRequest.body.probabilityOfDefault = 20;

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    await validateAboutExporter(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.not.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
      }),
    }));
  });

  it('redirects user to `application` page if response from api is successful', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutExporterResponse = new MockAboutExporterResponse();
    mockRequest.body.smeType = 'MICRO';
    mockRequest.body.probabilityOfDefault = '0';
    mockRequest.body.isFinanceIncreasing = 'true';

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getExporter = () => Promise.resolve(mockAboutExporterResponse);
    api.updateExporter = () => Promise.resolve();
    await validateAboutExporter(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getApplication = () => Promise.reject(mockedRejection);
    await validateAboutExporter(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
