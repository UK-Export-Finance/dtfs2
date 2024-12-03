class MandatoryCriteria {
  constructor(req) {
    this.version = req.version;
    this.isInDraft = req.isInDraft;
    this.title = req.title;
    this.introText = req.introText;
    this.criteria = req.criteria;
    this.createdAt = Date.now();
    this.updatedAt = null;
    this.auditRecord = req.auditRecord;
  }
}

module.exports = {
  MandatoryCriteria,
};
