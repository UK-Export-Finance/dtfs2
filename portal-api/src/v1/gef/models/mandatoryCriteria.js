class MandatoryCriteria {
  constructor(req) {
    this.version = req.version;
    this.isInDraft = true;
    this.title = req.title;
    this.htmlText = req.htmlText;
    this.createdAt = Date.now();
  }
}

module.exports = {
  MandatoryCriteria,
};
