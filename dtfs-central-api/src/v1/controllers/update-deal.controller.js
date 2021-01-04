const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./deal.controller');
const db = require('../../drivers/db-client');
const now = require('../../now');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

const handleEditedBy = async (dealId, dealUpdate, user) => {
  let editedBy = [];

  // sometimes we don't have a user making changes. When:
  // - we can get new data from type-b XML/workflow.
  // - some deal updates do not want to be marked as "edited by X user"
  // for example when a Checker submits a deal, they have not 'edited' the deal, only submitted it.

  if (user) {
    const {
      username,
      roles,
      bank,
      _id,
    } = user;

    const newEditedBy = {
      date: now(),
      username,
      roles,
      bank,
      userId: _id,
    };

    // if partial update
    // need to make sure that we have all existing entries in `editedBy`.
    // ideally we could refactor, perhaps, so that no partial updates are allowed.
    // but for now...
    if (!dealUpdate.editedBy) {
      const deal = await findOneDeal(dealId);
      editedBy = [
        ...deal.editedBy,
        newEditedBy,
      ];
    } else {
      editedBy = [
        ...dealUpdate.editedBy,
        newEditedBy,
      ];
    }
  }

  return editedBy;
};

const updateDeal = async (dealId, dealChanges, user, existingDeal) => {
  const collection = await db.getCollection('deals');

  const editedBy = await handleEditedBy(dealId, dealChanges, user);

  let existingDealDetails;
  if (existingDeal && existingDeal.details) {
    existingDealDetails = existingDeal.details;
  }

  let dealChangesDetails;
  if (dealChanges && dealChanges.details) {
    dealChangesDetails = dealChanges.details;
  }

  const update = {
    ...dealChanges,
    details: {
      ...existingDealDetails,
      ...dealChangesDetails,
      dateOfLastAction: now(),
    },
    editedBy,
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};
exports.updateDeal = updateDeal;

exports.updateDealPut = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      } else {
        const updatedDeal = await updateDeal(
          dealId,
          req.body,
          req.user,
          deal,
        );
        res.status(200).json(updatedDeal);
      }
    }
    res.status(404).send();
  });
};
