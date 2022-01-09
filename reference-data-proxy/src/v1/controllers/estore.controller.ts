import { Request, Response } from 'express';
import { createExporterSite, createBuyerFolder, createDealFolder, createFacilityFolder } from '../api-estore';

/* {
  exporter: NAME,
  buyer: NAME,
  "dealIdentifier": "0040000449",
  "destinationMarket": "United Kingdom",
  "riskMarket": "United States",
  facilityIdentifiers: [0040000450]
} */

export const createEstore = async (req: Request, res: Response) => {
  const { eStoreFolderInfo } = req.body;

  const { exporterName, buyerName, dealIdentifier, destinationMarket, riskMarket, facilityIdentifiers } = eStoreFolderInfo;

  const createSiteRes = await createExporterSite(exporterName);

  if (!createSiteRes) {
    return res.status(200).send({});
  }

  const { siteName } = createSiteRes.data;

  const result = {
    buyerName: '',
    folderName: '',
    facilities: {},
    siteName,
  };

  if (createSiteRes.status > 299) {
    return res.status(createSiteRes.status).send(createSiteRes.data);
  }

  const createBuyer = await createBuyerFolder({
    siteName,
    exporterName,
    buyerName,
  });
  result.buyerName = createBuyer.data.buyerName;

  const createDeal = await createDealFolder({
    siteName,
    exporterName,
    buyerName,
    dealIdentifier,
    destinationMarket,
    riskMarket,
  });
  result.folderName = createDeal.data.folderName;

  const createFacilities = facilityIdentifiers.map(
    (facilityIdentifier: any) =>
      new Promise((resolve, reject) =>
        // eslint-disable-next-line no-promise-executor-return
        createFacilityFolder({
          siteName,
          dealIdentifier,
          exporterName,
          buyerName,
          facilityIdentifier: facilityIdentifier.toString(),
          destinationMarket,
          riskMarket,
        }).then(
          ({ status, data }: any) => {
            if (status !== 201) {
              resolve(data);
            }
            resolve({
              facilityIdentifier,
              ...data,
            });
          },
          (err: any) => reject(err),
        ),
      ),
  );

  result.facilities = await Promise.all(createFacilities);

  return res.status(200).send(result);
};
