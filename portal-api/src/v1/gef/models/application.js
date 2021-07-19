const { STATUS } = require('../enums');

class Application {
  constructor(req, exporterId, coverTermsId) {
    if (exporterId) {
      // New Application
      this.userId = req.userId ? String(req.userId) : null;
      this.status = STATUS.IN_PROGRESS;
      this.bankId = req.bankId ? String(req.bankId) : null;
      this.exporterId = exporterId;
      this.coverTermsId = coverTermsId;
      this.bankInternalRefName = req.bankInternalRefName ? String(req.bankInternalRefName) : null;
      this.mandatoryVersionId = req.mandatoryVersionId ? String(req.mandatoryVersionId) : null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // Update
      this.updatedAt = Date.now();
    }
    this.additionalRefName = req.additionalRefName ? String(req.additionalRefName) : null;
  }
}

module.exports = {
  Application,
};
