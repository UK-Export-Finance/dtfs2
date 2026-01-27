/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */

import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { app } from '../../server/createApp';
import { api } from '../api';

const { APIM_TFS_URL, AZURE_ACBS_FUNCTION_URL } = process.env;
const testApi = api(app);

const mockACBSInput = {
  deal: {
    _id: 1234,
    dealSnapshot: {
      submissionDetails: {},
    },
  },
  bank: {},
};

const mockErrorDealInput = {
  ...mockACBSInput,
  deal: {
    ...mockACBSInput.deal,
    _id: 'errorId',
  },
};

const mockACBSFacilityInput = {
  facilityIdentifier: '1234',
  facility: {},
  deal: {},
};

const mockACBSFacilityErrorInput = {
  ...mockACBSFacilityInput,
  facilityIdentifier: 'errorId',
};

// Mock Axios
const axiosMock = new MockAdapter(axios);

describe('/acbs', () => {
  describe('POST /v1/acbs/', () => {
    axiosMock.onPost(`${AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs`, mockACBSInput).reply(HttpStatusCode.Ok, {});
    axiosMock.onPost(`${AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs`, mockErrorDealInput).reply(HttpStatusCode.BadRequest, {});

    it('should catch error on ACBS create record API call', async () => {
      const { status } = await testApi.post(mockErrorDealInput).to('/acbs');
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it('should return status code from ACBS create record API call', async () => {
      const { status } = await testApi.post(mockACBSInput).to('/acbs');
      expect(status).toEqual(HttpStatusCode.Ok);
    });
  });

  describe('POST /v1/acbs/facility/:id/issue', () => {
    axiosMock.onPost(`${AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs-issue-facility`, mockACBSFacilityInput).reply(HttpStatusCode.Ok, {});
    axiosMock.onPost(`${AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs-issue-facility`, mockACBSFacilityErrorInput).reply(HttpStatusCode.BadRequest, {});
    it('should catch error on ACBS issue facility API call', async () => {
      const { status } = await testApi.post(mockACBSFacilityErrorInput).to(`/acbs/facility/${mockACBSFacilityErrorInput.facilityIdentifier}/issue`);
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it('should return status code from ACBS issue facility API call', async () => {
      const { status } = await testApi.post(mockACBSFacilityInput).to(`/acbs/facility/${mockACBSFacilityInput.facilityIdentifier}/issue`);
      expect(status).toEqual(HttpStatusCode.Ok);
    });
  });

  describe('GET /v1/acbs/:dealId', () => {
    it('should return status code from ACBS response for a deal', async () => {
      axiosMock.onGet(`${APIM_TFS_URL}v1/deals/1234567890`).reply(HttpStatusCode.Ok, {});
      const { status } = await testApi.get('/acbs/deal/1234567890');
      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it('should return status code from ACBS response for a facility', async () => {
      axiosMock.onGet(`${APIM_TFS_URL}v1/facilities/1234567890`).reply(HttpStatusCode.Ok, {});
      const { status } = await testApi.get('/acbs/facility/1234567890');
      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it('should return 404 for a facility which does not exist', async () => {
      axiosMock.onGet(`${APIM_TFS_URL}v1/facilities/0000000000`).reply(HttpStatusCode.NotFound, {});
      const { status } = await testApi.get('/acbs/facility/0000000000');
      expect(status).toEqual(HttpStatusCode.NotFound);
    });

    it('should return 500 when entityType is not `deal` or `facility`', async () => {
      const { status } = await testApi.get('/acbs/test/1234567890');
      expect(status).toEqual(HttpStatusCode.InternalServerError);
    });
  });
});
