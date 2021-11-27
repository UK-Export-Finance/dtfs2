const { ObjectID } = require('mongodb');
const db = require('../../../drivers/db-client');

const applicationCollectionName = 'gef-application';
const exporterCollectionName = 'gef-exporter';
const facilitiesCollectionName = 'gef-facilities';

exports.clone = async (req, res) => {
  const collection = await db.getCollection(applicationCollectionName);
  const existingDeal = await collection.findOne({
    _id: ObjectID(String(req.body.applicationId)),
  });

  const clonedDeal = existingDeal;

  delete clonedDeal._id;
  delete clonedDeal.ukefDecision;

  clonedDeal.createdAt = Date.now();
  clonedDeal.updatedAt = Date.now();
  clonedDeal.facilitiesUpdated = Date.now();
  clonedDeal.status = 'DRAFT';
  clonedDeal.submissionCount = 0;
  clonedDeal.submissionDate = null;
  clonedDeal.submissionType = null;
  clonedDeal.eligibility.updatedAt = Date.now();
  clonedDeal.bankInternalRefName = req.body.bankInternalRefName;
  clonedDeal.additionalRefName = req.body.additionalRefName;
  clonedDeal.userId = req.body.userId;
  clonedDeal.bankId = req.body.bankId;
  clonedDeal.ukefDealId = null;
  clonedDeal.checkerId = null;
  clonedDeal.editedBy = [req.body.userId];

  const createdApplication = await collection.insertOne(clonedDeal);

  console.log(createdApplication.insertedId);

  res.send({ applicationId: createdApplication.insertedId });
};
