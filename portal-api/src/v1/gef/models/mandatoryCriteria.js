class MandatoryCriteria {
  constructor(req) {
    this.version = req.version;
    this.dealType = req.dealType;
    this.title = req.title;
    this.introText = req.introText;
    this.criteria = req.criteria;
  }
}

module.exports = {
  MandatoryCriteria,
};
