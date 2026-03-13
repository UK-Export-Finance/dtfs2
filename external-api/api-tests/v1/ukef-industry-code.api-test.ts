/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { app } from '../../server/createApp';
import { api } from '../api';

const { get } = api(app);

const axiosMock = new MockAdapter(axios);

axiosMock.onGet().reply((config) => {
  const industryCodeParam = (config.params as { industryCode?: string } | undefined)?.industryCode;

  if (industryCodeParam === '1406') {
    return [200, { ukefIndustryCode: '1003' }];
  }

  if (industryCodeParam === '1111') {
    return [404];
  }

  return [400];
});

describe('/ukef-industry-code', () => {
  describe('GET /ukef-industry-code/by-companies-house-industry-code/:industryCode', () => {
    it('should return a UKEF industry code by Companies House industry code', async () => {
      // Act
      const { status, body } = await get('/ukef-industry-code/by-companies-house-industry-code/1406');

      // Assert
      expect(status).toEqual(200);

      expect(body.ukefIndustryCode).toBeDefined();

      expect(body.ukefIndustryCode).toEqual('1003');
    });

    it('should return a 400 when an industryCode param is not provided', async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/');

      // Assert
      expect(status).toEqual(400);
    });

    it('should return a 400 when an industryCode param is below the required length', async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/123');

      // Assert
      expect(status).toEqual(400);
    });

    it('should return a 400 when an industryCode param is above the required length', async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/12345');

      // Assert
      expect(status).toEqual(400);
    });

    it("should return a 404 when industry-sector doesn't exist", async () => {
      // Act
      const { status } = await get('/ukef-industry-code/by-companies-house-industry-code/1111');

      // Assert
      expect(status).toEqual(404);
    });
  });
});
