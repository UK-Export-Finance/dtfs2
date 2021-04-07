const apiEstore = require('../api-estore');

/*
{
  exporter: NAME,
  buyer: NAME,
  "dealIdentifier": "0040000449",
  "destinationMarket": "United Kingdom",
  "riskMarket": "United States",
  facilityIdentifiers: [0040000450]
}
*/

const createEstore = async (req, res) => {
  const { eStoreFolderInfo } = req.body;

  const {
    exporterName,
    buyerName,
    dealIdentifier,
    destinationMarket,
    riskMarket,
    facilityIdentifiers,
  } = eStoreFolderInfo;

  const createSiteRes = await apiEstore.createExporterSite(exporterName);
  if (!createSiteRes.status === 200) {
    return createSiteRes;
  }

  const { siteName } = createSiteRes.data;

  if (createSiteRes.status !== 200) {
    res.status(createSiteRes.status).send(createSiteRes.data);
  }

  const createBuyer = apiEstore.createBuyerFolder({
    siteName,
    exporterName,
    buyerName,
  });

  const createDeal = apiEstore.createDealFolder({
    siteName,
    exporterName,
    buyerName,
    dealIdentifier,
    destinationMarket,
    riskMarket,
  });

  const createResult = await Promise.all([createBuyer, createDeal]);

  const result = createResult.map(({ data }) => data).reduce(
    (acc, curr) => ({
      ...acc,
      ...curr,
    }),
    {},
  );

  const createFacilities = facilityIdentifiers.map(
    (facilityIdentifier) => new Promise((resolve, reject) => apiEstore.createFacilityFolder({
      siteName,
      dealIdentifier,
      exporterName,
      buyerName,
      facilityIdentifier,
      destinationMarket,
      riskMarket,
    })
      .then(({ status, data }) => {
        if (status !== 201) {
          reject(Error(data));
        }
        resolve({
          facilityIdentifier,
          ...data,
        });
      },
      (err) => reject(err))),
  );

  result.facilities = await Promise.all(createFacilities);

  result.siteName = siteName;

  return res.status(200).send(result);
};


module.exports = {
  createEstore,
};
