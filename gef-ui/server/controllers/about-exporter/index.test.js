import {
  mappedIndustries,
  aboutExporter,
  validateAboutExporter,
} from './index';
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
  req.session = {
    user: {
      _id: '12345',
    },
  };
  req.query = {
    status: 'test',
  };
  req.params.dealId = '123';
  return req;
};

const mockApplication = {
  _id: '123',
  exporter: {
    companiesHouseRegistrationNumber: 'SC295862',
    companyName: '429 LIMITED',
    registeredAddress: {
      addressLine1: '4 Mill Road',
      addressLine2: 'Port Elphinstone',
      locality: 'Inverurie',
      postalCode: 'AB51 5UD',
    },
    updatedAt: 1639048330040.0,
    selectedIndustry: {
      code: '1011',
      name: 'Real estate activities',
      class: {
        code: '68209',
        name: 'Other letting and operating of own or leased real estate',
      },
    },
    industries: [
      {
        code: '1011',
        name: 'Real estate activities',
        class: {
          code: '68209',
          name: 'Other letting and operating of own or leased real estate',
        },
      },
    ],
    correspondenceAddress: {
      addressLine1: '2 MILL ROAD',
      addressLine2: 'PORT ELPHINSTONE',
      addressLine3: '',
      locality: 'INVERURIE',
      postalCode: 'AB51 5UD',
      country: 'United Kingdom',
    },
  },
};

describe('controllers/about-exporter', () => {
  let mockResponse;
  let mockRequest;
  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();

    api.getApplication.mockResolvedValue(mockApplication);
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET About Exporter', () => {
    it('renders the `About Exporter` template', async () => {
      await aboutExporter(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        dealId: '123',
        smeType: mockApplication.exporter.smeType,
        probabilityOfDefault: Number(mockApplication.exporter.probabilityOfDefault),
        isFinanceIncreasing: JSON.stringify(mockApplication.exporter.isFinanceIncreasing),
        selectedIndustry: mockApplication.exporter.selectedIndustry,
        industries: mappedIndustries(
          mockApplication.exporter.industries,
          JSON.stringify(mockApplication.exporter.selectedIndustry),
        ),
        status: mockRequest.query.status,
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

      expect(mockResponse.redirect).toHaveBeenCalledWith(`/gef/application-details/${mockRequest.params.dealId}`);
    });

    it('returns validation errors if `save and return` is set to true and probabilityOfDefault field has invalid value', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.probabilityOfDefault = 'foo';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', {
        errors: {
          errorSummary: [
            {
              href: '#probabilityOfDefault',
              text: 'You must enter a percentage between 0.01% to 14.09%',
            },
          ],
          fieldErrors: {
            probabilityOfDefault: {
              text: 'You must enter a percentage between 0.01% to 14.09%',
            },
          },
        },
        dealId: '123',
        smeType: mockRequest.body.smeType,
        probabilityOfDefault: Number(mockRequest.body.probabilityOfDefault),
        isFinanceIncreasing: mockRequest.body.isFinanceIncreasing,
        selectedIndustry: mockApplication.exporter.selectedIndustry,
        industries: expect.any(Array),
        status: mockRequest.query.status,
      });
    });

    it('returns validation errors if `save and return` is set to true and probabilityOfDefault field is outside value range', async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body.probabilityOfDefault = '14.2';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', {
        errors: expect.any(Object),
        dealId: '123',
        smeType: mockApplication.exporter.smeType,
        probabilityOfDefault: Number(mockRequest.body.probabilityOfDefault),
        isFinanceIncreasing: JSON.stringify(mockApplication.exporter.isFinanceIncreasing),
        selectedIndustry: mockApplication.exporter.selectedIndustry,
        industries: expect.any(Array),
        status: mockRequest.query.status,
      });
    });

    it('returns validation error object if no `save and return` query is set and all fields are blank', async () => {
      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', expect.objectContaining({
        errors: expect.any(Object),
        dealId: '123',
        smeType: mockApplication.exporter.smeType,
        probabilityOfDefault: Number(mockApplication.exporter.probabilityOfDefault),
        isFinanceIncreasing: JSON.stringify(mockApplication.exporter.isFinanceIncreasing),
        selectedIndustry: mockApplication.exporter.selectedIndustry,
        industries: expect.any(Array),
        status: mockRequest.query.status,
      }));
    });

    it('returns Selected Industry validation error only if there are more than 1 industries', async () => {
      mockRequest.body.selectedIndustry = '';
      mockRequest.body.smeType = 'MICRO';
      mockRequest.body.probabilityOfDefault = '5';
      mockRequest.body.isFinanceIncreasing = 'true';
      mockApplication.exporter.industries = [{
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

      api.getApplication.mockResolvedValueOnce(mockApplication);
      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', {
        errors: {
          errorSummary: [
            {
              href: '#selectedIndustry',
              text: 'Select most appropriate industry',
            },
          ],
          fieldErrors: {
            selectedIndustry: {
              text: 'Select most appropriate industry',
            },
          },
        },
        selectedIndustry: mockApplication.exporter.selectedIndustry,
        industries: mappedIndustries(
          mockApplication.exporter.industries,
          mockApplication.exporter.selectedIndustry,
        ),
        smeType: mockRequest.body.smeType,
        probabilityOfDefault: Number(mockRequest.body.probabilityOfDefault),
        isFinanceIncreasing: mockRequest.body.isFinanceIncreasing,
        dealId: '123',
        status: mockRequest.query.status,
      });

      mockApplication.exporter.industries = [{
        name: 'name',
        class: {
          name: 'class name',
        },
      }];
    });

    // TODO: fix.
    /*
    it('returns percentage error if non percentage value is entered', async () => {
      mockRequest.body.probabilityOfDefault = '123';

      await validateAboutExporter(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/about-exporter.njk', {
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#probabilityOfDefault', text: expect.any(String) }]),
        }),
        industries: null,
        smeType: undefined,
        probabilityOfDefault: '123',
        isFinanceIncreasing: undefined,
        selectedIndustry: null,
        dealId: '123',
      });

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
    */

    it('calls api.updateApplication with submitted information, retaining existing application.exporter data', async () => {
      mockRequest.body.smeType = 'MICRO';
      mockRequest.body.probabilityOfDefault = '5';
      mockRequest.body.isFinanceIncreasing = 'true';

      await validateAboutExporter(mockRequest, mockResponse);

      const expectedUpdateObj = {
        exporter: {
          ...mockApplication.exporter,
          ...mockRequest.body,
          isFinanceIncreasing: true,
          probabilityOfDefault: Number(mockRequest.body.probabilityOfDefault),
        },
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith(mockApplication._id, expectedUpdateObj);
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
