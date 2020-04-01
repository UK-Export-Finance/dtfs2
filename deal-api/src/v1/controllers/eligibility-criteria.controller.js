const { findOneDeal, update: updateDeal } = require('./deal.controller');

exports.update = async (req, res) => {
  await findOneDeal(req.params.id, (deal) => {
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
    };

    updateDeal(newReq, res);
  });
};
