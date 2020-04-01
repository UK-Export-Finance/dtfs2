const { findOneDeal, update: updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');


exports.update = async (req, res) => {
  await findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    }

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }


      const { eligibility: { criteria } } = deal;
      let criteriaComplete = true;

      const updatedCriteria = criteria.map((c) => {
        if (typeof req.body[`criterion-${c.id}`] === 'undefined') {
          criteriaComplete = false;
          return c;
        }

        return {
          ...c,
          answer: req.body[`criterion-${c.id}`].toLowerCase() === 'true',
        };
      });

      const updatedDeal = {
        ...deal,
        eligibility: {
          status: criteriaComplete ? 'Complete' : 'Incomplete',
          criteria: updatedCriteria,
        },
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
