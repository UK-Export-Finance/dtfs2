const { DEAL_TYPE, DEAL_STATUS } = require('../enums');

class Application {
  constructor(req, eligibility) {
    const editedBy = [];

    if (eligibility) {
      // New Application
      this.dealType = DEAL_TYPE;

      // ensure we don't consume any sensitive fields
      const {
        token,
        password,
        lastLogin,
        ...sanitisedMaker
      } = req.maker;

      this.maker = sanitisedMaker;

      this.status = DEAL_STATUS.DRAFT;
      this.bank = req.bank;

      this.exporter = req.exporter ? req.exporter : {
        status: DEAL_STATUS.NOT_STARTED,
      };

      this.eligibility = {
        ...eligibility,
        criteria: eligibility.criteria.map((term) => ({
          ...term,
          answer: null,
        })),
      };

      this.bankInternalRefName = req.bankInternalRefName ? String(req.bankInternalRefName) : null;
      this.mandatoryVersionId = req.mandatoryVersionId ? String(req.mandatoryVersionId) : null;
      this.createdAt = Date.now();
      this.updatedAt = Date.now();
      this.submissionType = null;
      this.submissionCount = 0;
      this.submissionDate = null;
      this.supportingInformation = {};
      this.ukefDealId = null;
      this.checkerId = null;
      editedBy.push(this.maker._id);
      this.editedBy = editedBy;
      this.additionalRefName = req.additionalRefName ? String(req.additionalRefName) : null;
      this.facilitiesUpdated = null;
      this.portalActivities = [];
    } else {
      // Update
      this.updatedAt = Date.now();

      // Only set properties if they are part of the request otherwise they get cleared
      // `ukefDecision` and 'manualInclusionNoticeSubmissionDate` in particular should not be changed in portal/gef but rather from tfm api
      const updatable = [
        'exporter',
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
        'ukefDecision',
        'manualInclusionNoticeSubmissionDate'
      ];

      if (req.exporter) {
        req.exporter.updatedAt = Date.now();
      }

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
