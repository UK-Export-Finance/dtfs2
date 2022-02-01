// import { app } from '../../src/createApp';
// const { post } = require('../api')(app);

// TODO: DTFS-5099
// jest.setTimeout(50000);
// describe('/estore', () => {
//   const eStoreData = {
//     exporterName: 'Exporter Name',
//     buyerName: 'GEF Buyer',
//     dealIdentifier: '123456',
//     destinationMarket: 'United Kingdom',
//     riskMarket: 'United States',
//     facilityIdentifiers: ['23456', '23457'],
//   };

//   const expectedEstoreResult = {
//     siteName: eStoreData.exporterName,
//     buyerName: eStoreData.buyerName,
//     folderName: `D ${eStoreData.dealIdentifier}`,
//     facilities: eStoreData.facilityIdentifiers.map((f) => ({
//       facilityIdentifier: f,
//       folderName: `F ${f}`,
//     })),
//   };

//   describe('POST /eStore', () => {
//     it('returns empty object if no result from eStore API', async () => {
//       const noExporterName = {
//         ...eStoreData,
//         exporterName: '',
//       };
//       const { status, body } = await post({ eStoreFolderInfo: noExporterName }).to('/estore');
//       expect(status).toEqual(400);
//       expect(body).toEqual({ message: 'Bad request' });
//     });

//     it('creates a eStore', async () => {
//       const { status, body } = await post({ eStoreFolderInfo: eStoreData }).to('/estore');
//       expect(status).toEqual(200);
//       expect(body).toEqual(expectedEstoreResult);
//     });
//   });
// });
