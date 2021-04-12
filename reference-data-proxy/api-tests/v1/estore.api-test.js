const app = require('../../src/createApp');

const { post } = require('../api')(app);

describe('/estore', () => {
  const eStoreData = {
    exporterName: 'exporter name',
    buyerName: 'buyer name',
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
      folderName: f,
    })),
  };


  describe('POST /eStore', () => {
    it('returns empty object if no result from eStore API', async () => {
      const noExporterName = {
        ...eStoreData,
        exporterName: '',
      };
      const { status, body } = await post({ eStoreFolderInfo: noExporterName }).to('/estore');

      expect(status).toEqual(200);
      expect(body).toEqual({});
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

    // it('returns error status if eStore facility create not successful', async () => {
    //   const errorCreate = {
    //     ...eStoreData,
    //     facilityIdentifiers: ['statusError'],
    //   };
    //   const { status, body } = await post({ eStoreFolderInfo: errorCreate }).to('/estore');

    //   expect(status).toEqual(401);
    //   expect(body).toEqual({ error: true });
    // });

    it('creates a eStore', async () => {
      const { status, body } = await post({ eStoreFolderInfo: eStoreData }).to('/estore');

      expect(status).toEqual(200);
      expect(body).toEqual(expectedEstoreResult);
    });
  });
});
