const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const moment = require('moment');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo, userOwns } = require('../users/checks');
const db = require('../../drivers/db-client');
const dealIntegration = require('./deal-integration.controller');

const validateStateChange = require('../validation/deal-status');

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      res.status(200).send(deal.details.status);
    }
  });
};

const updateStatus = async (collection, id, from, to) => {
  const statusUpdate = {
    details: {
      previousStatus: from,
      status: to,
      dateOfLastAction: moment().format('YYYY MM DD HH:mm:ss:SSS ZZ'),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: new ObjectId(id) } },
    $.flatten(statusUpdate),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

const updateComments = async (collection, id, commentToAdd, user) => {
  const commentToInsert = {
    comments: {
      username: user.username,
      timestamp: moment().format('YYYY MM DD HH:mm:ss:SSS ZZ'),
      text: commentToAdd,
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: new ObjectId(id) } },
    { $push: commentToInsert },
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

exports.update = (req, res) => {
  const { user } = req;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userHasAccessTo(req.user, deal)) return res.status(401).send();

    if (req.body.status === 'Abandoned Deal' && !userOwns(user, deal)) {
      return res.status(401).send();
    }

    const validationFailures = validateStateChange(deal, req.body, user);

    if (validationFailures) {
      return res.status(200).send({
        success: false,
        ...validationFailures,
      });
    }

    if (req.body.status === 'Submitted') {
      const typeA = await dealIntegration.createTypeA(deal);
      if (typeA.errorCount) {
        return res.status(200).send(typeA);
      }
    }

    const collection = await db.getCollection('deals');
    await updateStatus(collection, req.params.id, deal.details.status, req.body.status);
    const dealAfterAllUpdates = await updateComments(collection, req.params.id, req.body.comments, user);

    return res.status(200).send(dealAfterAllUpdates.details.status);
  });
};
