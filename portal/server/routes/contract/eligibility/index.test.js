const request = require('supertest');
const express = require('express');
const router = require('./index');
const getApiData = require('../../../helpers/getApiData');

jest.mock('../../../helpers/getApiData', () => jest.fn());

const app = express();
app.use(express.json());
app.use('/', router);

describe('POST /contract/:_id/eligibility/criteria', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
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

    getApiData.mockResolvedValue(apiResponse);

    const res = await request(app).post('/contract/123456/eligibility/criteria').send({ key: 'value' });

    expect(res.statusCode).toBe(302);
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

    getApiData.mockResolvedValue(apiResponse);

    const res = await request(app).post('/contract/123456/eligibility/criteria').send({ key: 'value' });

    expect(res.statusCode).toBe(302);
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

    getApiData.mockResolvedValue(deal);

    const res = await request(app).get('/contract/123456/eligibility/supporting-documentation');

    expect(res.statusCode).toBe(200);
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

    getApiData.mockResolvedValue(deal);

    const res = await request(app).get('/contract/123456/eligibility/supporting-documentation');

    expect(res.statusCode).toBe(200);
    expect(res.render).toHaveBeenCalledWith('eligibility/eligibility-supporting-documentation.njk', expect.any(Object));
  });
});
