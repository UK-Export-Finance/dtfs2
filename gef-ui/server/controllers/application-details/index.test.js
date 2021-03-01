import applicationDetails from './index';
import * as api from '../../services/api';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => ({
  params: {
    applicationId: '123',
  },
  url: '/fakeurl.com',
});

const MockApplicationResponse = () => ({
  exporterId: '123',
});

const MockExporterResponse = () => ({
  details: {
    companiesHouseRegistrationNumber: 'tedsi',
  },
  validation: {
    required: [],
  },
});

const mockResponse = MockResponse();
const mockRequest = MockRequest();
const mockApplicationResponse = MockApplicationResponse();
const mockExporterResponse = MockExporterResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Application Details', () => {
  it('renders the `Application Details` template', async () => {
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await applicationDetails(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/application-details.njk', expect.objectContaining({
      exporterRows: expect.any(Array),
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
