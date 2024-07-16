const { isValid, parseISO } = require('date-fns');
const { isFacilityEndDateEnabledOnGefVersion, InvalidParameterError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { validateFacilityEndDateParameters } = require('../../validation/facility-end-date-validation');
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
  /**
   * @param {object} req - The facility properties to create/update
   * @param {number | undefined} dealVersion
   * @throws {import('@ukef/dtfs2-common').ApiError} - if facility end date parameters are invalid
   * @throws {InvalidParameterError} - if `facilityEndDate` is defined & is not a ISO-8601 date string
   * @throws {InvalidParameterError} - if `bankReviewDate` is defined & is not a ISO-8601 date string
   */
  constructor(req, dealVersion) {
    validateFacilityEndDateParameters(req, dealVersion);

    if (req.dealId) {
      // new facility
      this.dealId = ObjectId(req.dealId);
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
      if (req.hasBeenIssuedAndAcknowledged != null) {
        this.hasBeenIssuedAndAcknowledged = Boolean(req.hasBeenIssuedAndAcknowledged);
      }
      /**
       * canResubmitIssuedFacilities used temporarily once unissued facility changed to issued after first UKEF submission
       * used to populate change links on facility table and show which facilities changed to issued
       * Used as a criteria for resubmission to UKEF
       */
      this.canResubmitIssuedFacilities = null;
      if (req.canResubmitIssuedFacilities != null) {
        this.canResubmitIssuedFacilities = Boolean(req.canResubmitIssuedFacilities);
      }
      // used to store the user details of maker who changed unissued facility to issued
      this.unissuedToIssuedByMaker = Object(req.unissuedToIssuedByMaker) || null;

      if (isFacilityEndDateEnabledOnGefVersion(dealVersion)) {
        this.#validateAndSetFacilityEndDateValues(req);
        this.isUsingFacilityEndDate = this.isUsingFacilityEndDate ?? null;
        this.bankReviewDate = this.bankReviewDate ?? null;
        this.facilityEndDate = this.facilityEndDate ?? null;
      }
    } else {
      // update facility
      if (req.hasBeenIssued != null) {
        this.hasBeenIssued = Boolean(req.hasBeenIssued);
      }

      if (req.hasBeenIssuedAndAcknowledged) {
        this.hasBeenIssuedAndAcknowledged = Boolean(req.hasBeenIssuedAndAcknowledged);
      }

      if (req.name != null) {
        this.name = String(req.name);
      }

      if (req.shouldCoverStartOnSubmission != null) {
        this.shouldCoverStartOnSubmission = Boolean(req.shouldCoverStartOnSubmission);
      }

      if (req.coverStartDate != null) {
        const timestamp = convertToTimestamp(req.coverStartDate);
        this.coverStartDate = new Date(timestamp);
      }

      if (req.coverEndDate != null) {
        const timestamp = convertToTimestamp(req.coverEndDate);
        this.coverEndDate = new Date(timestamp);
      }

      if (req.issueDate != null) {
        const timestamp = convertToTimestamp(req.issueDate);
        this.issueDate = new Date(timestamp);
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
        this.currency = req.currency || null;
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
        this.paymentType = req.paymentType;
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
        this.issueDate = null;
      } else if (req.hasBeenIssued === true && !req.canResubmitIssuedFacilities) {
        // if has been issued and changed to issued after submission, then monthsOfCover should not be set to null
        this.monthsOfCover = null;
      }

      if (req.coverDateConfirmed === true || req.coverDateConfirmed === false) {
        this.coverDateConfirmed = req.coverDateConfirmed;
      }

      if (req.canResubmitIssuedFacilities != null) {
        this.canResubmitIssuedFacilities = Boolean(req.canResubmitIssuedFacilities);
      }

      if (req.unissuedToIssuedByMaker != null) {
        this.unissuedToIssuedByMaker = Object(req.unissuedToIssuedByMaker);
      }

      if (req.specialIssuePermission != null) {
        this.specialIssuePermission = Object(req.specialIssuePermission);
      }

      if (isFacilityEndDateEnabledOnGefVersion(dealVersion)) {
        this.#validateAndSetFacilityEndDateValues(req);
      }

      this.updatedAt = Date.now();
    }
    this.auditRecord = req.auditRecord;
  }

  #validateAndSetFacilityEndDateValues(req) {
    if ('isUsingFacilityEndDate' in req) {
      this.isUsingFacilityEndDate = req.isUsingFacilityEndDate;
      if (req.isUsingFacilityEndDate) {
        this.bankReviewDate = null;
      } else {
        this.facilityEndDate = null;
      }
    }

    if ('bankReviewDate' in req) {
      const bankReviewDate = parseISO(req.bankReviewDate);
      if (!isValid(bankReviewDate)) {
        throw new InvalidParameterError('bankReviewDate', req.bankReviewDate);
      }

      this.bankReviewDate = bankReviewDate;
      this.isUsingFacilityEndDate = false;
      this.facilityEndDate = null;
    }

    if ('facilityEndDate' in req) {
      const facilityEndDate = parseISO(req.facilityEndDate);
      if (!isValid(facilityEndDate)) {
        throw new InvalidParameterError('facilityEndDate', req.facilityEndDate);
      }

      this.facilityEndDate = facilityEndDate;
      this.isUsingFacilityEndDate = true;
      this.bankReviewDate = null;
    }
  }
}

module.exports = {
  Facility,
};
