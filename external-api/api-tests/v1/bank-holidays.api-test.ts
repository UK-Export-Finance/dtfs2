import { app } from '../../src/createApp';
import { api } from '../api';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { mockResponseBankHolidays } from '../test-mocks/bank-holidays';
import { getYear, addYears } from 'date-fns';
import { BankHolidaysEvent } from '../../src/interfaces';

const { get } = api(app);

describe('/bank-holidays', () => {
  // @ts-ignore
  const mock = new MockAdapter(axios);

  describe('when Bank Holiday API call returns 200 and body contains data', () => {
    mock.onGet('https://www.gov.uk/bank-holidays.json').reply(200, { data: mockResponseBankHolidays });

    it('should return a status of 200 with expected body', async () => {
      const { status, body } = await get('/bank-holidays');
      expect(status).toEqual(200);
      expect(body).toBeDefined();
    });

    it("should contain property 'england-and-wales'", async () => {
      const { body } = await get('/bank-holidays');
      expect(body['england-and-wales']).toBeDefined();
    });
  });

  describe('when Bank Holiday API call returns 200 but body does not contain data', () => {
    mock.onGet('https://www.gov.uk/bank-holidays.json').reply(200, undefined);

    it('should return a status of 200 with backup data body', async () => {
      const { status, body } = await get('/bank-holidays');

      expect(status).toEqual(200);
      expect(body).toBeDefined();
    });

    it("should contain property 'england-and-wales'", async () => {
      const { body } = await get('/bank-holidays');
      expect(body['england-and-wales']).toBeDefined();
    });
  });

  describe('when Bank Holiday API call returns 400', () => {
    mock.onGet('https://www.gov.uk/bank-holidays.json').reply(400, undefined);

    it('should return a status of 200 with backup data body', async () => {
      const { status, body } = await get('/bank-holidays');

      expect(status).toEqual(200);
      expect(body).toBeDefined();
    });

    it("should contain property 'england-and-wales'", async () => {
      const { body } = await get('/bank-holidays');
      expect(body['england-and-wales']).toBeDefined();
    });

    // If this test fails the backup data should be updated as it's likely out of date
    it('should contain data for next year when using backup data', async () => {
      const nextYear = getYear(addYears(new Date(), 1));
      const { body } = await get('/bank-holidays');

      const resultingBankHolidayYears = body['england-and-wales'].events.map((event: BankHolidaysEvent) => getYear(new Date(event.date)));
      expect(resultingBankHolidayYears).toContain(nextYear);
    });
  });
});
