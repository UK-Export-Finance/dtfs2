import { aboutExporter, validateAboutExporter } from './index';
import api from '../../services/api';

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
  req.body = {};
  req.query = {};
  req.params.applicationId = '123';
  return req;
};

const MockExporterResponse = () => {
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

describe('controllers/about-exporter', () => {
  let mockResponse;
  let mockRequest;
  let mockExporterResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockExporterResponse = MockExporterResponse();

    api.getApplication.mockResolvedValue({});
    api.getExporter.mockResolvedValue(mockExporterResponse);
    api.updateExporter.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET About Exporter', () => {
    it('renders the `About Exporter` template', async () => {
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
      api.getApplication.mockRejectedValueOnce();
      await aboutExporter(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate About Exporter', () => {
    it('returns no validation errors if `save and return` is set to true and all fields are blank', async () => {
      mockRequest.query.saveAndReturn = 'true';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(`/gef/application-details/${mockRequest.params.applicationId}`);
    });

    it('returns validation errors if `save and return` is set to true and probabilityOfDefault field has invalid value', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.probabilityOfDefault = 'foo';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.any(Object),
        industries: null,
        selectedIndustry: null,
        smeType: undefined,
        status: undefined,
        probabilityOfDefault: 'foo',
        isFinanceIncreasing: undefined,
        applicationId: '123',
      }));
    });

    it('returns validation errors if `save and return` is set to true and probabilityOfDefault field is outside value range', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.probabilityOfDefault = '14.2';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.any(Object),
        industries: null,
        selectedIndustry: null,
        smeType: undefined,
        status: undefined,
        probabilityOfDefault: '14.2',
        isFinanceIncreasing: undefined,
        applicationId: '123',
      }));
    });

    it('returns validation error object if no `save and return` query is set and all fields are blank', async () => {
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

    it('returns validation error object if no `save and return` query is set and probabilityOfDefault field is outside value range', async () => {
      mockRequest.body.probabilityOfDefault = '14.2';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.any(Object),
        industries: null,
        selectedIndustry: null,
        smeType: undefined,
        status: undefined,
        probabilityOfDefault: '14.2',
        isFinanceIncreasing: undefined,
        applicationId: '123',
      }));
    });

    it('returns Selected Industry validation error only if there are more than 1 industries', async () => {
      mockRequest.body.selectedIndustry = '';
      mockExporterResponse.details.industries = [{
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

      api.getExporter.mockResolvedValueOnce(mockExporterResponse);
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

      mockExporterResponse.details.industries = [{
        name: 'name',
        class: {
          name: 'class name',
        },
      }];

      api.getExporter.mockResolvedValueOnce(mockExporterResponse);
      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#selectedIndustry', text: expect.any(String) }]),
        }),
      }));
    });

    it('returns percentage error if non percentage value is entered', async () => {
      mockRequest.body.probabilityOfDefault = '123';

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

      // value of mock passed, should result in error
      mockRequest.body.probabilityOfDefault = 'mock';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
        }),
      }));

      // negative value passed, should result in error
      mockRequest.body.probabilityOfDefault = '-10';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
        }),
      }));

      // 0 value passed, should result in error
      mockRequest.body.probabilityOfDefault = '0';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
        }),
      }));

      // value below , should result in error
      mockRequest.body.probabilityOfDefault = '14.09';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.not.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
        }),
      }));

      // value below , should result in error
      mockRequest.body.probabilityOfDefault = '14.11';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
        }),
      }));
    });

    it('redirects user to `application` page if response from api is successful', async () => {
      mockRequest.body.smeType = 'MICRO';
      mockRequest.body.probabilityOfDefault = '5';
      mockRequest.body.isFinanceIncreasing = 'true';

      await validateAboutExporter(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      const mockedRejection = { response: { status: 400, message: 'Whoops' } };
      api.getApplication.mockRejectedValueOnce(mockedRejection);

      await validateAboutExporter(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
