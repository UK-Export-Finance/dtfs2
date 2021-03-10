class EligibilityCriteria {
  constructor(req) {
    this.version = req.version;
    this.isInDraft = req.isInDraft;
    this.terms = req.terms;
    this.createdAt = Date.now();
  }
}

module.exports = {
  EligibilityCriteria,
};
