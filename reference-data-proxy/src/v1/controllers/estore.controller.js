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

  if (!createSiteRes) {
    return res.status(200).send({});
  }

  const { siteName } = createSiteRes.data;

  const result = {
    siteName,
  };

  if (createSiteRes.status !== 200) {
    return res.status(createSiteRes.status).send(createSiteRes.data);
  }

  const createBuyer = await apiEstore.createBuyerFolder({
    siteName,
    exporterName,
    buyerName,
  });
  result.buyerName = createBuyer.data.buyerName;

  const createDeal = await apiEstore.createDealFolder({
    siteName,
    exporterName,
    buyerName,
    dealIdentifier,
    destinationMarket,
    riskMarket,
  });
  result.folderName = createDeal.data.folderName;

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

  return res.status(200).send(result);
};


module.exports = {
  createEstore,
};
