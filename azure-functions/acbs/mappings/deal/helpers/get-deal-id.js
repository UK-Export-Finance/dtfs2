const getDealId = (deal) => {
  if (deal.dealSnapshot.ukefDealId) {
    return deal.dealSnapshot.ukefDealId.padStart(10, 0);
  }
  return deal.dealSnapshot.details.ukefDealId.padStart(10, 0);
};

module.exports = getDealId;
