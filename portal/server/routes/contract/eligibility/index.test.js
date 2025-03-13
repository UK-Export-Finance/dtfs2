import { router } from './index';
import getApiData from '../../../helpers/getApiData';

jest.mock('../../../helpers', () => ({
  __esModule: true,
  requestParams: jest.fn(() => ({ userToken: 'token', _id: 123456 })),
  getApiData: jest.fn(),
}));

describe('POST /contract/:_id/eligibility/criteria', () => {
  it('redirects to criteria page with errors when validation fails', async () => {
    const apiResponse = {
      eligibility: {
        validationErrors: {
          count: 1,
          errorList: {
            error: 'Error message',
          },
        },
      },
    };

    jest.mocked(getApiData).mockResolvedValue(apiResponse);

    const req = {
      params: {
        _id: 123456,
      },
      session: {
        userToken: 'token',
      },
    };

    const res = {
      redirect: jest.fn(),
    };

    await router.post('/contract/:_id/eligibility/criteria')(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/contract/123456/eligibility/criteria?errors=true');
  });

  it('redirects to supporting-documentation page when validation succeeds', async () => {
    const apiResponse = {
      eligibility: {
        validationErrors: {
          count: 0,
          errorList: {},
        },
      },
    };

    jest.mocked(getApiData).mockResolvedValue(apiResponse);

    const req = {
      params: {
        _id: 123456,
      },
      session: {
        userToken: 'token',
      },
    };

    const res = {
      redirect: jest.fn(),
    };

    await router.post('/contract/:_id/eligibility/criteria')(req, res);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/contract/123456/eligibility/supporting-documentation');
  });
});

describe('GET /contract/:_id/eligibility/supporting-documentation', () => {
  it('renders supporting-documentation page with errors', async () => {
    const deal = {
      eligibility: {
        validationErrors: {
          count: 1,
          errorList: {
            error: 'Error message',
          },
        },
      },
      supportingInformation: {
        validationErrors: {
          count: 1,
          errorList: {
            error: 'Error message',
          },
        },
      },
    };

    jest.mocked(getApiData).mockResolvedValue(deal);

    const req = {
      params: {
        _id: 123456,
      },
      session: {
        userToken: 'token',
      },
    };

    const res = {
      render: jest.fn(),
    };

    await router.get('/contract/:_id/eligibility/supporting-documentation')(req, res);

    expect(res.render).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith('eligibility/eligibility-supporting-documentation.njk', expect.any(Object));
  });

  it('renders supporting-documentation page without errors', async () => {
    const deal = {
      eligibility: {
        validationErrors: {
          count: 0,
          errorList: {},
        },
      },
      supportingInformation: {
        validationErrors: {
          count: 0,
          errorList: {},
        },
      },
    };

    jest.mocked(getApiData).mockResolvedValue(deal);

    const req = {
      params: {
        _id: 123456,
      },
      session: {
        userToken: 'token',
      },
    };

    const res = {
      render: jest.fn(),
    };

    await router.get('/contract/:_id/eligibility/supporting-documentation')(req, res);

    expect(res.render).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith('eligibility/eligibility-supporting-documentation.njk', expect.any(Object));
  });
});
