const mapGefDealSnapshot = require('./mapGefDealSnapshot');

const mapGefDeal = (deal) => {
  // fields that need to be in GEF data:
  // submissionType
  // submissionDate
  // ukefDealId
  // bankName
  // maker {
  //   firstname
  //   surname
  //   email
  // }
  // dealCurrency(e.g 'EUR')
  // dealValue(e.g 1234)
  // eligibility []

  const mapped = {
    _id: deal._id,
    dealSnapshot: mapGefDealSnapshot(deal.dealSnapshot),
    tfm: {},
  };

  return mapped;
};


module.exports = mapGefDeal;
