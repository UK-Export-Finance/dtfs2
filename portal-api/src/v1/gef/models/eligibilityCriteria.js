class EligibilityCriteria {
  constructor(req) {
    this.version = req.version;
    this.isInDraft = req.isInDraft;
    this.criteria = req.criteria;
    this.dealType = req.dealType;
    this.createdAt = Date.now();
  }
}

module.exports = {
  EligibilityCriteria,
};
