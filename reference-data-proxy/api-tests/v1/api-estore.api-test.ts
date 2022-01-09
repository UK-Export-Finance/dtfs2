import * as api from '../../src/v1/api-estore';

jest.unmock('../../src/v1/api-estore');

const mockResponses = {
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
   jest.fn(({ data }: any) => {
      if (data[0].exporterName === 'triggerCatch') {
         return Promise.reject(mockResponses['404']);
      }
      return Promise.resolve(mockResponses['200']);
   })
);

describe('api calls', () => {
   describe('createExporterSite', () => {
      beforeAll(() => {
         process.env.MULESOFT_API_UKEF_ESTORE_EA_URL = 'mockUrl';
      });

      it('should catch error if error is returned', async () => {
         const { status } = await api.createExporterSite('triggerCatch');
         expect(status).toEqual(404);
      });

      it('should return status code from createExporterSite', async () => {
         const { status } = await api.createExporterSite(1234);
         expect(status).toEqual(200);
      });

      it('should return status code from createBuyerFolder', async () => {
         const { status } = await api.createBuyerFolder(1234);
         expect(status).toEqual(200);
      });

      it('should return status code from createDealFolder', async () => {
         const { status } = await api.createDealFolder(1234);
         expect(status).toEqual(200);
      });

      it('should return status code from createFacilityFolder', async () => {
         const { status } = await api.createFacilityFolder(1234);
         expect(status).toEqual(200);
      });
   });
});
