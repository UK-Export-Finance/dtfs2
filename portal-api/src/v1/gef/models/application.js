const { DEAL_TYPE, STATUS } = require('../enums');

class Application {
  constructor(req, exporterId, eligibilityTerms) {
    const editedBy = [];

    if (exporterId && eligibilityTerms) {
      // New Application
      this.dealType = DEAL_TYPE;
      this.userId = req.userId ? String(req.userId) : null;
      this.status = STATUS.DRAFT;
      this.bankId = req.bankId ? String(req.bankId) : null;

      this.exporterId = exporterId;

      this.eligibility = {
        criteria: eligibilityTerms.map((term) => ({
          ...term,
          answer: null,
        })),
      };

      this.bankInternalRefName = req.bankInternalRefName ? String(req.bankInternalRefName) : null;
      this.mandatoryVersionId = req.mandatoryVersionId ? String(req.mandatoryVersionId) : null;
      this.createdAt = Date.now();
      this.updatedAt = null;
      this.submissionType = null;
      this.submissionCount = 0;
      this.submissionDate = null;
      this.supportingInformation = {};
      this.ukefDealId = null;
      this.checkerId = null;
      editedBy.push(this.userId);
      this.editedBy = editedBy;
      this.additionalRefName = req.additionalRefName ? String(req.additionalRefName) : null;
      this.facilitiesUpdated = null;
      this.portalActivities = [];
    } else {
      // Update
      this.updatedAt = Date.now();

      // Only set properties if they are part of the request otherwise they get cleared
      const updatable = [
        'comments',
        'submissionType',
        'submissionCount',
        'submissionDate',
        'ukefDealId',
        'editorId',
        'checkerId',
        'supportingInformation',
        'bankInternalRefName',
        'additionalRefName',
        'eligibility',
        'facilitiesUpdated',
        'ukefDecisionAccepted',
        'portalActivities',
      ];

      if (req.eligibility) {
        req.eligibility.updatedAt = Date.now();
      }

      Object.entries(req).forEach(([key, value]) => {
        if (updatable.includes(key)) {
          this[key] = value;
        }
      });
    }
  }
}

module.exports = {
  Application,
};
