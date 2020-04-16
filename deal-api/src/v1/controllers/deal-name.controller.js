const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const moment = require('moment');
const { findOneDeal } = require('./deal.controller');
const { userOwns } = require('../users/checks');
const db = require('../../drivers/db-client');
const validateNameChange = require('../validation/deal-name');

const updateName = async (collection, deal, to) => {
  const update = {
    details: {
      bankSupplyContractName: to,
      dateOfLastAction: moment().format('YYYY MM DD HH:mm:ss:SSS ZZ'),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: new ObjectId(deal._id) } }, // eslint-disable-line no-underscore-dangle
    $.flatten(update),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;
  return value;
};

exports.update = (req, res) => {
  const { user } = req;
  const { bankSupplyContractName } = req.body;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      if (userOwns(user, deal)) {
        res.status(401).send();
      } else {
        const validationFailures = validateNameChange(deal, bankSupplyContractName);

        if (validationFailures) {
          res.status(200).send({
            success: false,
            ...validationFailures,
          });
        } else {
          const collection = await db.getCollection('deals');

          const dealAfterAllUpdates = await updateName(collection, deal, bankSupplyContractName);

          res.status(200).send(dealAfterAllUpdates.details.bankSupplyContractName);
        }
      }
    }
  });
};
