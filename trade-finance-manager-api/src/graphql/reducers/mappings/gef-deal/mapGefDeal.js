const mapGefDeal = (deal) => ({
  _id: deal._id,
  dealSnapshot: {
    _id: deal._id,
    details: {},
    totals: {},
    facilities: [],
    submissionDetails: {},
    eligibilityCriteria: [],
    eligibility: {},
    dealFiles: {},
  },
  tfm: {},
});


module.exports = mapGefDeal;
