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
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
      exporter: {
        status: expect.any(Object), // status[exporter.status],
        rows: expect.any(Array), // mapSummaryList(exporter, exporterItems(exporterUrl)),
      },
      facilities: {
        status: expect.any(Object), // status[mockedFacilities.status],
        items: expect.any(Array),
      },
    }));
  });
});

// describe('Create Application', () => {
//   it('returns error object if `bankInternalRefName` property is empty', async () => {
//     const mockRequest = {
//       body: {
//         bankInternalRefName: '',
//       },
//       session: {
//         user: {
//           _id: 'abc',
//         },
//       },
//     };
//     await createApplication(mockRequest, mockResponse);
//     expect(mockResponse.render).toHaveBeenCalledWith('partials/name-application.njk', expect.objectContaining({
//       errors: expect.any(Object),
//     }));
//   });

//   it('redirects user to `application details` page if successful', async () => {
//     const mockRequest = {
//       body: {
//         bankInternalRefName: '1234',
//       },
//       session: {
//         user: {
//           _id: 'abc',
//         },
//       },
//     };
//     const mockApplication = {
//       _id: '123456',
//       bankInternalRefName: 'Ref Name',
//     };

//     api.createApplication = () => Promise.resolve(mockApplication);
//     await createApplication(mockRequest, mockResponse);
//     expect(mockResponse.redirect).toHaveBeenCalledWith('application-details/123456');
//   });

//   it('redirects user to `problem with service` page if there is an issue with the API', async () => {
//     const mockRequest = {
//       body: {
//         bankInternalRefName: '1234',
//       },
//       session: {
//         user: {
//           _id: 'abc',
//         },
//       },
//     };

//     api.createApplication = () => Promise.reject();
//     await createApplication(mockRequest, mockResponse);
//     expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
//   });
// });
