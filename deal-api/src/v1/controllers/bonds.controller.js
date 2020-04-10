const { ObjectId } = require('mongodb');
const { findOneDeal, update: updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');

exports.create = async (req, res) => {
  await findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    }

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const updatedBondTransactions = {
        ...deal.bondTransactions,
        items: [
          ...deal.bondTransactions.items,
          {
            _id: new ObjectId(),
          },
        ],
      };

      const updatedDeal = {
        ...deal,
        bondTransactions: updatedBondTransactions,
      };

      const newReq = {
        params: req.params,
        body: updatedDeal,
        user: req.user,
      };

      updateDeal(newReq, res);
    }
  });
};
