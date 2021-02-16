
const { findOneDeal } = require('../../portal/deal/get-deal.controller');

exports.findOneDealGet = async (req, res) => {
  const deal = await findOneDeal(req.params.id, false, 'tfm');
  if (deal) {
    return res.status(200).send({
      deal,
    });
  }

  return res.status(404).send();
};
