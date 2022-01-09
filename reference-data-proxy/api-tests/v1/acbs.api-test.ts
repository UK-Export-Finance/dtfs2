import { app } from '../../src/createApp';
const api = require('../api')(app);

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
      if (url === `${process.env.MULESOFT_API_ACBS_DEAL_URL}/1234`) {
        return Promise.resolve(mockResponses['200']);
      }

      if (url === `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/1234`) {
        return Promise.resolve(mockResponses['200']);
      }

      if (url === `${process.env.MULESOFT_API_ACBS_DEAL_URL}/5678`) {
        return Promise.reject(mockResponses['404']);
      }

      if (url === `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/5678`) {
        return Promise.reject(mockResponses['404']);
      }
    }

    if (method === 'post') {
      if (url === `${process.env.AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs`) {
        if (data.deal._id === 'errorId') {
          return Promise.reject(mockResponses['404']);
        }
        return Promise.resolve(mockResponses['200']);
      }
      if (url === `${process.env.AZURE_ACBS_FUNCTION_URL}/api/orchestrators/acbs-issue-facility`) {
        if (data.facilityId === 'errorId') {
          return Promise.reject(mockResponses['404']);
        }
        return Promise.resolve(mockResponses['200']);
      }
    }
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
      const { status } = await api.post(errorInput).to('/acbs');
      expect(status).toEqual(404);
    });

    it('should return status code from ACBS create record API call', async () => {
      const { status } = await api.post(mockACBSInput).to('/acbs');

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
      const { status } = await api.post(mockACBSInput).to('/acbs/facility/errorId/issue');
      expect(status).toEqual(404);
    });

    it('should return status code from ACBS issue facility API call', async () => {
      const { status } = await api.post(mockACBSInput).to(`/acbs/facility/${mockACBSInput.facilityId}/issue`);
      expect(status).toEqual(200);
    });
  });

  describe('GET /v1/acbs/:dealId', () => {
    it('should return status code from ACBS response for a deal', async () => {
      const { status } = await api.get('/acbs/deal/1234');
      expect(status).toEqual(200);
    });

    it('should return status code from ACBS response for a facility', async () => {
      const { status } = await api.get('/acbs/facility/1234');
      expect(status).toEqual(200);
    });

    it('should return 404 for a facility', async () => {
      const { status } = await api.get('/acbs/facility/5678');
      expect(status).toEqual(404);
    });

    it('should return 500 when entityType is not `deal` or `facility`', async () => {
      const { status } = await api.get('/acbs/test/1234');
      expect(status).toEqual(500);
    });
  });
});
