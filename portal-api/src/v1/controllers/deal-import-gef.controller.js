const db = require('../../drivers/db-client');
const { isSuperUser } = require('../users/checks');

const importDealAndFacilities = async (req, res) => {
  if (!isSuperUser(req.user)) {
    res.status(401).send();
  }

  const collection = await db.getCollection('deals');

  const newDeal = req.body;

  const deal = await collection.insertOne({ ...newDeal });

  if (!deal.insertedId) {
    return res.status(400).send(`Error importing V1 GEF deal with id: ${newDeal.dataMigration.drupalDealId}`);
  }

  const { insertedId: dealId } = deal;

  const createdDeal = deal.ops && deal.ops[0];

  return res.status(200).send(createdDeal);
};

exports.import = async (req, res) => {
  const result = await importDealAndFacilities(req, res);
  return result;
};
