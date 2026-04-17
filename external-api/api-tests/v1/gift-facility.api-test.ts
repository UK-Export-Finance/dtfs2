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

const { post } = api(app);

describe('/gift', () => {
  describe('POST /facility', () => {
    const baseUrl = String(APIM_TFS_URL);
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

      nock(baseUrl).persist().post(url).reply(HttpStatusCode.Created, mockApimTfsResponse);

      // Act
      const { body, status } = await post(mockBody).to('/gift/facility');

      // Assert
      expect(status).toEqual(HttpStatusCode.Created);

      expect(body).toEqual(mockApimTfsResponse.data);
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

    describe('when the response does not return data', () => {
      it(`should return ${HttpStatusCode.InternalServerError} status`, async () => {
        // Arrange
        nock.abortPendingRequests();
        nock.cleanAll();

        nock(baseUrl).persist().post(url).reply(HttpStatusCode.Created);

        // Act
        const { status } = await post(mockBody).to('/gift/facility');

        // Assert
        expect(status).toEqual(HttpStatusCode.InternalServerError);
      });
    });
  });
});
