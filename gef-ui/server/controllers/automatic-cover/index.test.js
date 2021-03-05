import { automaticCover, validateAutomaticCover } from './index';
import * as api from '../../services/api';


const MockRequest = () => {
  const req = {};
  req.params = {};
  req.params.applicationId = '123';

  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockCoverResponse = () => {
  const res = {};
  res.items = [];
  return res;
};

const mockRequest = new MockRequest();
const mockResponse = new MockResponse();
const mockCoverResponse = new MockCoverResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Automatic Cover', () => {
  it('renders the `automatic-cover` template', async () => {
    api.getAutomaticCover = () => Promise.resolve(mockCoverResponse);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/automatic-cover.njk', {
      terms: expect.any(Array),
      applicationId: '123',
    });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getAutomaticCover = () => Promise.reject(mockedRejection);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

// describe('Validate Mandatory Criteria', () => {
//   it('returns error object if mandatory criteria property is empty', async () => {
//     const mockedRequest = {
//       body: {
//         mandatoryCriteria: '',
//       },
//     };
//     api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
//     await validateMandatoryCriteria(mockedRequest, response);
//     expect(response.render).toHaveBeenCalledWith('partials/mandatory-criteria.njk', expect.objectContaining({
//       criteria: expect.any(Object),
//       errors: expect.any(Object),
//     }));
//   });

//   it('redirects user to `name application` page if they select `true`', async () => {
//     const mockedRequest = {
//       body: {
//         mandatoryCriteria: 'true',
//       },
//     };
//     api.getMandatoryCriteria = () => Promise.resolve(mockCriteria);
//     await validateMandatoryCriteria(mockedRequest, response);
//     expect(response.redirect).toHaveBeenCalledWith('name-application');
//   });

//   it('redirects user to `ineligible` page if they select `false`', async () => {
//     const mockedRequest = {
//       body: {
//         mandatoryCriteria: 'false',
//       },
//     };
//     await validateMandatoryCriteria(mockedRequest, response);
//     expect(response.redirect).toHaveBeenCalledWith('ineligible');
//   });
// });
