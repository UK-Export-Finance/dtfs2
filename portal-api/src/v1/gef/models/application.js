const { DEAL_TYPE, STATUS } = require('../enums');

class Application {
  constructor(req, exporterId, coverTermsId) {
    if (exporterId) {
      // New Application
      this.dealType = DEAL_TYPE;
      this.userId = req.userId ? String(req.userId) : null;
      this.status = STATUS.DRAFT;
      this.bankId = req.bankId ? String(req.bankId) : null;
      this.exporterId = exporterId;
      this.coverTermsId = coverTermsId;
      this.bankInternalRefName = req.bankInternalRefName ? String(req.bankInternalRefName) : null;
      this.mandatoryVersionId = req.mandatoryVersionId ? String(req.mandatoryVersionId) : null;
      this.createdAt = Date.now();
      this.updatedAt = null;
      this.submissionType = null;
      this.submissionCount = 0;
      this.submissionDate = null;
      this.ukefDealId = null;
      this.checkerId = null;
    } else {
      // Update
      this.updatedAt = Date.now();
      this.comments = req.comments;
      this.submissionType = req.submissionType;
      this.submissionCount = req.submissionCount;
      this.submissionDate = req.submissionDate;
      this.ukefDealId = req.ukefDealId;
      this.checkerId = req.checkerId;
    }
    this.additionalRefName = req.additionalRefName ? String(req.additionalRefName) : null;
  }
}

module.exports = {
  Application,
};
