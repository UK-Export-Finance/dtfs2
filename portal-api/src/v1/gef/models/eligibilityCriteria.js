class EligibilityCriteria {
  constructor(req) {
    this.version = req.version;
    this.product = req.product;
    this.isInDraft = req.isInDraft;
    this.criteria = req.criteria;
    this.createdAt = Date.now();
  }
}

module.exports = {
  EligibilityCriteria,
};
