import { app } from '../../src/createApp';
import { api } from '../api';

const testApi = api(app);

const mockResponses: any = {
  200: {
    status: 200,
    data: {},
  },
  404: {
    status: 404,
    response: {
      status: 404,
    },
  },
};

jest.mock('axios', () =>
  jest.fn((args: any) => {
    const { method, url, data } = args;

    if (method === 'get') {
      if (url === `${process.env.APIM_TFS_URL}deals/1234567890`) {
        return Promise.resolve(mockResponses['200']);
      }

      if (url === `${process.env.APIM_TFS_URL}facilities/1234567890`) {
        return Promise.resolve(mockResponses['200']);
      }

      if (url === `${process.env.APIM_TFS_URL}deals/0000000000`) {
        return Promise.resolve(mockResponses['404']);
      }

      if (url === `${process.env.APIM_TFS_URL}facilities/0000000000`) {
        return Promise.resolve(mockResponses['404']);
      }
    }

    if (method === 'post') {
      if (url === `${process.env.AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs`) {
        if (data.deal._id === 'errorId') {
          return Promise.resolve(mockResponses['404']);
        }
        return Promise.resolve(mockResponses['200']);
      }
      if (url === `${process.env.AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs-issue-facility`) {
        if (data.facilityId === 'errorId') {
          return Promise.resolve(mockResponses['404']);
        }
        return Promise.resolve(mockResponses['200']);
      }
    }

    return Promise.resolve(mockResponses['400']);
  }),
);

describe('/acbs', () => {
  describe('POST /v1/acbs/', () => {
    const mockACBSInput = {
      deal: {
        _id: 1234,
        dealSnapshot: {
          submissionDetails: {},
        },
      },
      extraInfo: {
        supplierAcbsIndustryId: 1234,
      },
    };

    it('should catch error on ACBS create record API call', async () => {
      const errorInput = {
        ...mockACBSInput,
        deal: {
          ...mockACBSInput.deal,
          _id: 'errorId',
        },
      };
      const { status } = await testApi.post(errorInput).to('/acbs');
      expect(status).toEqual(404);
    });

    it('should return status code from ACBS create record API call', async () => {
      const { status } = await testApi.post(mockACBSInput).to('/acbs');

      expect(status).toEqual(200);
    });
  });

  describe('POST /v1/acbs/facility/:id/issue', () => {
    const mockACBSInput = {
      facilityId: '1234',
      facility: {},
      supplierName: '',
    };
    it('should catch error on ACBS issue facility API call', async () => {
      const { status } = await testApi.post(mockACBSInput).to('/acbs/facility/errorId/issue');
      expect(status).toEqual(404);
    });

    it('should return status code from ACBS issue facility API call', async () => {
      const { status } = await testApi.post(mockACBSInput).to(`/acbs/facility/${mockACBSInput.facilityId}/issue`);
      expect(status).toEqual(200);
    });
  });

  describe('GET /v1/acbs/:dealId', () => {
    it('should return status code from ACBS response for a deal', async () => {
      const { status } = await testApi.get('/acbs/deal/1234567890');
      expect(status).toEqual(200);
    });

    it('should return status code from ACBS response for a facility', async () => {
      const { status } = await testApi.get('/acbs/facility/1234567890');
      expect(status).toEqual(200);
    });

    it('should return 404 for a deal', async () => {
      const { status } = await testApi.get('/acbs/deal/0000000000');
      expect(status).toEqual(404);
    });

    it('should return 404 for a facility', async () => {
      const { status } = await testApi.get('/acbs/facility/0000000000');
      expect(status).toEqual(404);
    });

    it('should return 500 when entityType is not `deal` or `facility`', async () => {
      const { status } = await testApi.get('/acbs/test/1234567890');
      expect(status).toEqual(500);
    });
  });
});
