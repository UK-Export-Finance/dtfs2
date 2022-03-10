const db = require('../../drivers/db-client');
const { isSuperUser } = require('../users/checks');
const { importFacilities } = require('./facilities-import-gef.controller');

const importDealAndFacilities = async (req, res) => {
  if (!isSuperUser(req.user)) {
    res.status(401).send();
  }

  const collection = await db.getCollection('deals');

  const {
    deal,
    facilities,
  } = req.body;

  const createdDeal = await collection.insertOne({ ...deal });

  const { insertedId: dealId } = createdDeal;

  if (!dealId) {
    return res.status(400).send(`Error importing V1 GEF deal with id: ${deal.dataMigration.drupalDealId}`);
  }

  const dealData = createdDeal.ops && createdDeal.ops[0];

  const facilitiesWithDealId = facilities.map((facility) => ({
    ...facility,
    dealId,
  }));

  const createdFacilities = await importFacilities(facilitiesWithDealId);

  if (!createdFacilities) {
    return res.status(400).send(`Error importing V1 GEF facilities with deal id: ${deal.dataMigration.drupalDealId}`);
  }

  return res.status(200).send({
    deal: dealData,
    facilities: createdFacilities,
  });
};

exports.import = async (req, res) => {
  const result = await importDealAndFacilities(req, res);
  return result;
};
