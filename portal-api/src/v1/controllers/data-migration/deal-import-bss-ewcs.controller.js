const sanitizeHtml = require('sanitize-html');
const db = require('../../../drivers/db-client');
const { isSuperUser } = require('../../users/checks');
const getDealErrors = require('../../validation/deal');
const { createMultipleFacilities } = require('../facilities.controller');

const importDealAndFacilities = async (req, res) => {
  if (!isSuperUser(req.user)) {
    res.status(401).send();
  }

  const collection = await db.getCollection('deals');

  const newDeal = req.body;

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      ...newDeal,
      validationErrors,
    });
  }

  const deal = await collection.insertOne({
    ...newDeal,
  });

  if (!deal.insertedId) {
    return res.status(400).send(`Error importing V1 BSS/EWCS deal with id: ${sanitizeHtml(newDeal.dataMigration.drupalDealId)}`);
  }

  const { insertedId: dealId } = deal;

  const createdDeal = deal.ops && deal.ops[0];

  const facilities = [
    ...newDeal.bondTransactions.items,
    ...newDeal.loanTransactions.items,
  ];

  const createdFacilities = await createMultipleFacilities(
    facilities,
    dealId,
    req.user,
  );

  if (createdFacilities.status !== 200) {
    return res.status(400).send(`Error importing facilities for V1 deal id: ${sanitizeHtml(newDeal.dataMigrationInfo.v1_ID)}`);
  }

  return res.status(200).send(createdDeal);
};

exports.import = async (req, res) => {
  const result = await importDealAndFacilities(req, res);
  return result;
};
