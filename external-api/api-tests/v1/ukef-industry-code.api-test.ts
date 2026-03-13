/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { app } from '../../server/createApp';
import { api } from '../api';

const { get } = api(app);

describe('/ukef-industry-code', () => {
  const axiosMock = new MockAdapter(axios);

  describe('GET /ukef-industry-code/by-companies-house-industry-code/:industryCode', () => {
    beforeEach(() => {
      axiosMock.onGet().reply((config) => {
        const industryCodeParam = config.url?.split('/').pop();

        if (industryCodeParam === '1406') {
          return [HttpStatusCode.Ok, { ukefIndustryCode: '1003' }];
        }

        if (industryCodeParam === '1111') {
          return [HttpStatusCode.NotFound];
        }

        return [HttpStatusCode.BadRequest];
      });
    });

    it('should return a UKEF industry code by Companies House industry code', async () => {
      // Act
      const { status, body } = await get('/ukef-industry-code/by-companies-house-industry-code/1406');

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);

      expect(body.ukefIndustryCode).toBeDefined();

      expect(body.ukefIndustryCode).toEqual('1003');
    });

    it(`should return a ${HttpStatusCode.NotFound} when an industryCode param is not provided`, async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/');

      // Assert
      expect(status).toEqual(HttpStatusCode.NotFound);
    });

    it(`should return a ${HttpStatusCode.BadRequest} when an industryCode param is below the required length`, async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/123');

      // Assert
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it(`should return a ${HttpStatusCode.BadRequest} when an industryCode param is above the required length`, async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/12345');

      // Assert
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it(`should return a ${HttpStatusCode.NotFound} when industry-sector doesn't exist`, async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/1111');

      // Assert
      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });
});
