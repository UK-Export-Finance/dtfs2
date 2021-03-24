import aboutExporter from './index';
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
  req.params.applicationId = '123';
  return req;
};

const MockAboutExporterResponse = () => {
  const res = {};
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

    api.getApplication = () => Promise.resolve(mockAboutExporterResponse);
    await aboutExporter(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
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
