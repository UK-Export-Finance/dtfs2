import { app } from '../../src/createApp';
const { post } = require('../api')(app);

jest.setTimeout(50000);
describe('/estore', () => {
   const eStoreData = {
      exporterName: 'Exporter Name',
      buyerName: 'GEF Buyer',
      dealIdentifier: '123456',
      destinationMarket: 'United Kingdom',
      riskMarket: 'United States',
      facilityIdentifiers: ['23456', '23457'],
   };

   const expectedEstoreResult = {
      siteName: eStoreData.exporterName,
      buyerName: eStoreData.buyerName,
      folderName: eStoreData.dealIdentifier,
      facilities: eStoreData.facilityIdentifiers.map((f) => ({
         facilityIdentifier: f,
         folderName: `F ${f}`,
      })),
   };

   describe('POST /eStore', () => {
      it('returns empty object if no result from eStore API', async () => {
         const noExporterName = {
            ...eStoreData,
            exporterName: '',
         };
         const { status, body } = await post({ eStoreFolderInfo: noExporterName }).to('/estore');
         // const abc = await post({ eStoreFolderInfo: noExporterName }).to('/estore');
         // console.log(abc)
         expect(status).toEqual(400);
         expect(body).toEqual({ message: 'Bad request' });
      });

      it('returns error status if eStore site create not successful', async () => {
         const errorCreate = {
            ...eStoreData,
            exporterName: 'statusError',
         };
         const { status, body } = await post({ eStoreFolderInfo: errorCreate }).to('/estore');
         expect(status).toEqual(401);
         expect(body).toEqual({ error: true });
      });

      it('creates a eStore', async () => {
         const { status, body } = await post({ eStoreFolderInfo: eStoreData }).to('/estore');
         expect(status).toEqual(200);
         expect(body).toEqual(expectedEstoreResult);
      });
   });
});
