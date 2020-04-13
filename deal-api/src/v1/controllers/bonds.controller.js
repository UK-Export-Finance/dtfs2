const { ObjectId } = require('mongodb');
const db = require('../../db-driver/client');
const { findOneDeal, update: updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');

exports.create = async (req, res) => {
  // await findOneDeal(req.params.id, async (deal) => {
  //   if (!deal) {
  //     res.status(404).send();
  //   }

  //   if (deal) {
  //     if (!userHasAccessTo(req.user, deal)) {
  //       res.status(401).send();
  //     }

  const collection = await db.getCollection('deals');

  const newBondObj = { _id: new ObjectId() };

  const updatedDeal = await collection.findOneAndUpdate(
    { _id: ObjectId(req.params.id) },
    { $push: { 'bondTransactions.items': { ...newBondObj } } },
    { upsert: false },
    { returnOriginal: false },
  );

  // TOOD: if !updatedDeal.ok (?)

  return res.status(200).send({
    ...updatedDeal.value,
    bondId: newBondObj._id, // eslint-disable-line no-underscore-dangle
  });
};

exports.updateBond = async (req, res) => {
  const {
    id: dealId,
    bondId,
  } = req.params;

  const updatedBond = {
    _id: ObjectId(bondId),
    ...req.body,
  };

  const collection = await db.getCollection('deals');
  const result = await collection.findOneAndUpdate(
    {
      _id: ObjectId(dealId),
      'bondTransactions.items._id': ObjectId(bondId),
    }, {
      $set: { 'bondTransactions.items.$': { ...updatedBond } },
    },
    { upsert: false },
  );
  return res.status(200).send(result.value);
};
