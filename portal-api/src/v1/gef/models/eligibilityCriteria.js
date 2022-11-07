class EligibilityCriteria {
  constructor(req) {
    this.version = req.version;
    this.criteria = req.criteria;
    this.dealType = req.dealType;
  }
}

module.exports = {
  EligibilityCriteria,
};
