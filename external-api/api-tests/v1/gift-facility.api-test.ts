/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { HttpStatusCode } from 'axios';
import nock from 'nock';
import * as dotenv from 'dotenv';
import { APIM_GIFT_PAYLOADS_EXAMPLES } from '@ukef/dtfs2-common';
import { app } from '../../server/createApp';
import { api } from '../api';

dotenv.config();

const { APIM_TFS_URL } = process.env;

const { post, get } = api(app);

describe('/gift', () => {
  const baseUrl = String(APIM_TFS_URL);

  describe('GET /facilities?ids=...', () => {
    const facilityIds = ['11111', '22222'];
    const ids = facilityIds.join(',');

    const mockResponseBody = {
      facilities: [
        { facilityId: facilityIds[0], status: HttpStatusCode.Ok },
        { facilityId: facilityIds[1], status: HttpStatusCode.NotFound },
      ],
    };

    describe(`when ids query parameter is provided`, () => {
      it(`should return ${HttpStatusCode.Ok} with APIM TFS data`, async () => {
        // Arrange
        nock.abortPendingRequests();
        nock.cleanAll();

        nock(baseUrl).get('/v2/gift/facilities').query({ ids }).reply(HttpStatusCode.Ok, mockResponseBody);

        // Act
        const response = await get(`/gift/facilities?ids=${ids}`);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual(mockResponseBody);
      });
    });

    describe(`when ids query parameter is missing`, () => {
      it(`should return ${HttpStatusCode.BadRequest}`, async () => {
        // Act
        const response = await get('/gift/facilities');

        // Assert
        expect(response.status).toEqual(HttpStatusCode.BadRequest);
        expect(response.body).toEqual({ status: HttpStatusCode.BadRequest, message: 'ids query parameter is required' });
      });
    });
  });

  describe('GET /facility/:facilityId', () => {
    const mockFacilityId = '12345';
    const url = `/v2/gift/facility/${mockFacilityId}`;

    describe(`when APIM TFS returns ${HttpStatusCode.Ok}`, () => {
      it(`should return a ${HttpStatusCode.Ok} status with data received from APIM TFS`, async () => {
        // Arrange
        nock.abortPendingRequests();
        nock.cleanAll();

        nock(baseUrl).get(url).reply(HttpStatusCode.Ok, {});

        // Act
        const { status } = await get(`/gift/facility/${mockFacilityId}`);

        // Assert
        expect(status).toEqual(HttpStatusCode.Ok);
      });
    });

    describe(`when APIM TFS returns ${HttpStatusCode.NotFound}`, () => {
      it(`should return a ${HttpStatusCode.NotFound} status`, async () => {
        // Arrange
        nock.abortPendingRequests();
        nock.cleanAll();

        nock(baseUrl).get(url).reply(HttpStatusCode.NotFound, {});

        // Act
        const { status } = await get(`/gift/facility/${mockFacilityId}`);

        // Assert
        expect(status).toEqual(HttpStatusCode.NotFound);
      });
    });

    describe(`when the APIM TFS endpoint returns a status that is NOT ${HttpStatusCode.Ok} or ${HttpStatusCode.NotFound}`, () => {
      it('should return the same status from the APIM TFS endpoint', async () => {
        // Arrange
        nock.abortPendingRequests();
        nock.cleanAll();

        const mockStatusCode = HttpStatusCode.BadGateway;

        nock(baseUrl).persist().get(url).reply(mockStatusCode, {});

        // Act
        const { status } = await get(`/gift/facility/${mockFacilityId}`);

        // Assert
        expect(status).toEqual(mockStatusCode);
      });
    });
  });

  describe('POST /facility', () => {
    const url = '/v2/gift/facility';
    const mockBody = APIM_GIFT_PAYLOADS_EXAMPLES.CREATE_FACILITY.VALID_PAYLOAD;

    const mockApimTfsResponse = {
      data: {},
      status: HttpStatusCode.Created,
    };

    it(`should return a ${HttpStatusCode.Created} status with data received from APIM TFS`, async () => {
      // Arrange
      nock.abortPendingRequests();
      nock.cleanAll();

      nock(baseUrl).post(url).reply(HttpStatusCode.Created, mockApimTfsResponse);

      // Act
      const { status } = await post(mockBody).to('/gift/facility');

      // Assert
      expect(status).toEqual(HttpStatusCode.Created);
    });

    describe(`when the APIM TFS endpoint returns a status that is NOT ${HttpStatusCode.Created}`, () => {
      it(`should return the same status from the APIM TFS endpoint`, async () => {
        // Arrange
        nock.abortPendingRequests();
        nock.cleanAll();

        const mockStatusCode = HttpStatusCode.ImATeapot;

        nock(baseUrl).persist().post(url).reply(mockStatusCode, mockApimTfsResponse);

        // Act
        const { status } = await post(mockBody).to('/gift/facility');

        expect(status).toEqual(mockStatusCode);
      });
    });
  });
});
