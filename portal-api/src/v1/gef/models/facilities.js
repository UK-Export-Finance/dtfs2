const { ObjectId } = require('mongodb');
const convertToTimestamp = require('../../helpers/convertToTimestamp');

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

class Facility {
  constructor(req) {
    if (req.dealId) {
      // new facility
      this.dealId = req.dealId ? ObjectId(req.dealId) : null;
      this.type = checkType(req.type);
      this.hasBeenIssued = null;
      if (req.hasBeenIssued) {
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
      this.currency = req.currency || null;
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
      this.hasBeenIssuedAndAcknowledged = null;
      if (req.hasBeenIssuedAndAcknowledged) {
        this.hasBeenIssuedAndAcknowledged = Boolean(req.hasBeenIssuedAndAcknowledged);
      }
      /**
       * canResubmitIssuedFacilities used temporarily once unissued facility changed to issued after first UKEF submission
       * used to populate change links on facility table and show which facilities changed to issued
       * Used as a criteria for resubmission to UKEF
       */
      this.canResubmitIssuedFacilities = null;
      if (req.canResubmitIssuedFacilities) {
        this.canResubmitIssuedFacilities = Boolean(req.canResubmitIssuedFacilities);
      }
      // used to store the user details of maker who changed unissued facility to issued
      this.unissuedToIssuedByMaker = Object(req.unissuedToIssuedByMaker) || null;
    } else {
      // update facility
      if (req.hasBeenIssued) {
        this.hasBeenIssued = Boolean(req.hasBeenIssued);
      }

      if (req.hasBeenIssuedAndAcknowledged) {
        this.hasBeenIssuedAndAcknowledged = Boolean(req.hasBeenIssuedAndAcknowledged);
      }

      if (req.name) {
        this.name = String(req.name);
      }

      if (req.shouldCoverStartOnSubmission) {
        this.shouldCoverStartOnSubmission = Boolean(req.shouldCoverStartOnSubmission);
      }

      if (req.coverStartDate) {
        const timestamp = convertToTimestamp(req.coverStartDate);
        this.coverStartDate = new Date(timestamp);
      }

      if (req.coverEndDate) {
        const timestamp = convertToTimestamp(req.coverEndDate);
        this.coverEndDate = new Date(timestamp);
      }

      if (req.issueDate) {
        const timestamp = convertToTimestamp(req.issueDate);
        this.issueDate = new Date(timestamp);
      }

      if (req.monthsOfCover === null) {
        this.monthsOfCover = req.monthsOfCover;
      } else if (req.monthsOfCover !== undefined) {
        this.monthsOfCover = Number(req.monthsOfCover);
      }

      if (req.details) {
        this.details = req.details;
      }

      if (req.detailsOther) {
        this.detailsOther = String(req.detailsOther);
      }

      if (req.currency) {
        this.currency = req.currency || null;
      }

      if (req.value) {
        this.value = Number(req.value);
      }

      if (req.coverPercentage) {
        this.coverPercentage = Number(req.coverPercentage);
      }

      if (req.interestPercentage) {
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

      if (req.paymentType) {
        this.paymentType = req.paymentType;
      }

      if (req.ukefExposure) {
        this.ukefExposure = req.ukefExposure;
      }

      if (req.guaranteeFee) {
        this.guaranteeFee = req.guaranteeFee;
      }

      if (req.ukefFacilityId && req.ukefFacilityId !== null) {
        this.ukefFacilityId = req.ukefFacilityId;
      }

      if (req.submittedAsIssuedDate) {
        this.submittedAsIssuedDate = req.submittedAsIssuedDate;
      }

      if (req.shouldCoverStartOnSubmission === true) {
        this.coverStartDate = null;
      }

      if (req.hasBeenIssued === false) {
        this.coverStartDate = null;
        this.coverEndDate = null;
        this.shouldCoverStartOnSubmission = null;
        this.issueDate = null;
      } else if (req.hasBeenIssued === true && !req.canResubmitIssuedFacilities) {
        // if has been issued and changed to issued after submission, then monthsOfCover should not be set to null
        this.monthsOfCover = null;
      }

      if (req.coverDateConfirmed === true || req.coverDateConfirmed === false) {
        this.coverDateConfirmed = req.coverDateConfirmed;
      }

      if (req.canResubmitIssuedFacilities) {
        this.canResubmitIssuedFacilities = Boolean(req.canResubmitIssuedFacilities);
      }

      if (req.unissuedToIssuedByMaker) {
        this.unissuedToIssuedByMaker = Object(req.unissuedToIssuedByMaker);
      }

      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Facility,
};
