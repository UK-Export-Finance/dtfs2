import { app } from '../../src/createApp';
import { api } from '../api';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { mockResponseBankHolidays } from '../test-mocks/bank-holidays';

const { get } = api(app);

describe('/bank-holidays', () => {
  const mock = new MockAdapter(axios);
  jest.mock('axios', () => jest.requireActual('axios'));

  const mockSuccessfulApiResponse = {
    status: 200,
    data: {
      mockResponseBankHolidays,
    },
  };

  const mockSemiSuccessfulApiResponse = {
    status: 200,
    data: undefined,
  };

  const mockUnsuccessfulApiResponse = {
    status: 400,
  };

  it('should return a status of 200 with expected body if API call is successful', async () => {
    mock.onGet('https://www.gov.uk/bank-holidays.json').reply(200, mockSuccessfulApiResponse);
    const { status, body } = await get('/bank-holidays');

    expect(status).toEqual(200);
    expect(body.data.result).toBeDefined();
  });

  it('should return a status of 200 with stored data body if API call is semi successful', async () => {
    mock.onGet('https://www.gov.uk/bank-holidays.json').reply(200, mockSemiSuccessfulApiResponse);
    const { status, body } = await get('/bank-holidays');

    expect(status).toEqual(200);
    expect(body.data.result).toBeDefined();
  });

  it('should return a status of 200 with expected body if API call is successful', async () => {
    mock.onGet('https://www.gov.uk/bank-holidays.json').reply(200, mockUnsuccessfulApiResponse);
    const { status, body } = await get('/bank-holidays');

    expect(status).toEqual(200);
    expect(body.data.result).toBeDefined();
  });
});
