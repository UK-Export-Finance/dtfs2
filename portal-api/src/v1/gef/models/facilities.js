const { ObjectID } = require('mongodb');

const checkType = (type) => {
  if (type) {
    switch (type) {
      case 'Cash':
      case 'Contingent':
        return type;
      default:
        return null;
    }
  } else {
    return null;
  }
};

const checkPaymentType = (paymentType) => {
  if (paymentType) {
    switch (paymentType.toUpperCase()) {
      case 'IN_ARREARS_MONTHLY':
      case 'IN_ARREARS_QUARTLY':
      case 'IN_ARREARS_SEMI_ANNUALLY':
      case 'IN_ARREARS_ANNUALLY':
      case 'IN_ADVANCE_QUARTERLY':
      case 'IN_ADVANCE_MONTHLY':
      case 'IN_ADVANCE_SEMI_ANNUALLY':
      case 'IN_ADVANCE_ANNUALLY':
      case 'AT_MATURITY':
        return paymentType;
      default:
        return null;
    }
  } else {
    return null;
  }
};

class Facility {
  constructor(req) {
    if (req.dealId) {
      // new facility
      this.dealId = req.dealId ? new ObjectID(req.dealId) : null;
      this.type = checkType(req.type);
      this.hasBeenIssued = null;
      if (req.hasBeenIssued != null) {
        this.hasBeenIssued = Boolean(req.hasBeenIssued);
      }
      this.name = req.name || null;
      this.shouldCoverStartOnSubmission = null;
      this.coverStartDate = null;
      this.coverEndDate = null;
      this.issueDate = null;
      this.monthsOfCover = null;
      this.details = null;
      this.detailsOther = null;
      this.currency = { id: req.currency || null };
      this.value = req.value || null;
      this.coverPercentage = null;
      this.interestPercentage = null;
      this.paymentType = null;
      this.createdAt = Date.now();
      this.updatedAt = Date.now();
      this.ukefExposure = 0;
      this.guaranteeFee = 0;
      this.submittedAsIssuedDate = req.submittedAsIssuedDate || null;
      this.ukefFacilityId = req.ukefFacilityId || null;
      this.feeType = null;
      this.feeFrequency = null;
      this.dayCountBasis = null;
      this.coverDateConfirmed = null;
      /**
       * canResubmitIssuedFacilities used temporarily once unissued facility changed to issued after first UKEF submission
       * used to populate change links on facility table and show which facilities changed to issued
       * Used as a criteria for resubmission to UKEF
       */
      this.canResubmitIssuedFacilities = null;
      if (req.canResubmitIssuedFacilities != null) {
        this.canResubmitIssuedFacilities = Boolean(req.canResubmitIssuedFacilities);
      }
      this.unissuedToIssuedBy = Object(req.unissuedToIssuedBy) || null;
    } else {
      // update facility
      if (req.hasBeenIssued != null) {
        this.hasBeenIssued = Boolean(req.hasBeenIssued);
      }

      if (req.name != null) {
        this.name = String(req.name);
      }

      if (req.shouldCoverStartOnSubmission != null) {
        this.shouldCoverStartOnSubmission = Boolean(req.shouldCoverStartOnSubmission);
      }

      if (req.coverStartDate != null) {
        this.coverStartDate = new Date(req.coverStartDate);
      }

      if (req.coverEndDate != null) {
        this.coverEndDate = new Date(req.coverEndDate);
      }

      if (req.issueDate != null) {
        this.issueDate = new Date(req.issueDate);
      }

      if (req.monthsOfCover === null) {
        this.monthsOfCover = req.monthsOfCover;
      } else if (req.monthsOfCover !== undefined) {
        this.monthsOfCover = Number(req.monthsOfCover);
      }

      if (req.details != null) {
        this.details = req.details;
      }

      if (req.detailsOther != null) {
        this.detailsOther = String(req.detailsOther);
      }

      if (req.currency != null) {
        this.currency = { id: req.currency || null };
      }

      if (req.value != null) {
        this.value = Number(req.value);
      }

      if (req.coverPercentage != null) {
        this.coverPercentage = Number(req.coverPercentage);
      }

      if (req.interestPercentage != null) {
        this.interestPercentage = Number(req.interestPercentage);
      }

      if (req.feeType) {
        this.feeType = req.feeType;
      }

      if (req.feeFrequency) {
        this.feeFrequency = req.feeFrequency;
      }

      if (req.dayCountBasis) {
        this.dayCountBasis = Number(req.dayCountBasis);
      }

      if (req.paymentType != null) {
        this.paymentType = checkPaymentType(req.paymentType);
      }

      if (req.ukefExposure != null) {
        this.ukefExposure = req.ukefExposure;
      }

      if (req.guaranteeFee != null) {
        this.guaranteeFee = req.guaranteeFee;
      }

      if (req.ukefFacilityId && req.ukefFacilityId !== null) {
        this.ukefFacilityId = req.ukefFacilityId;
      }

      if (req.submittedAsIssuedDate != null) {
        this.submittedAsIssuedDate = req.submittedAsIssuedDate;
      }

      if (req.shouldCoverStartOnSubmission === true) {
        this.coverStartDate = null;
      }

      if (req.hasBeenIssued === false) {
        this.coverStartDate = null;
        this.coverEndDate = null;
        this.shouldCoverStartOnSubmission = null;
      } else if (req.hasBeenIssued === true) {
        this.monthsOfCover = null;
      }

      if (req.coverDateConfirmed) {
        this.coverDateConfirmed = req.coverDateConfirmed;
      }

      if (req.canResubmitIssuedFacilities != null) {
        this.canResubmitIssuedFacilities = Boolean(req.canResubmitIssuedFacilities);
      }

      if (req.unissuedToIssuedBy != null) {
        this.unissuedToIssuedBy = Object(req.unissuedToIssuedBy);
      }

      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Facility,
};
