function checkType(type) {
  if (type) {
    switch (type.toUpperCase()) {
      case 'CASH':
      case 'CONTINGENT':
        return type.toUpperCase();
      default:
        return null;
    }
  } else {
    return null;
  }
}

function checkPaymentType(paymentType) {
  if (paymentType) {
    switch (paymentType.toUpperCase()) {
      case 'IN_ARREARS_QUARTLY':
      case 'IN_ADVANCE_QUARTERLY':
        return paymentType.toUpperCase();
      default:
        return null;
    }
  } else {
    return null;
  }
}

class Facility {
  constructor(req) {
    if (req.applicationId) {
      // new application
      this.applicationId = req.applicationId ? req.applicationId : null;
      this.type = checkType(req.type);
      this.hasBeenIssued = null;
      this.name = null;
      this.startOnDayOfNotice = null;
      this.coverStartDate = null;
      this.coverEndDate = null;
      this.monthsOfCover = null;
      this.details = null;
      this.detailsOther = null;
      this.currency = null;
      this.value = null;
      this.coverPercentage = null;
      this.interestPercentage = null;
      this.paymentType = null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // update application
      if (req.hasBeenIssued) {
        this.hasBeenIssued = Boolean(req.hasBeenIssued);
      }

      if (req.name) {
        this.name = String(req.name);
      }

      if (req.startOnDayOfNotice) {
        this.startOnDayOfNotice = Boolean(req.startOnDayOfNotice);
      }

      if (req.coverStartDate) {
        this.coverStartDate = new Date(req.coverStartDate);
      }

      if (req.coverEndDate) {
        this.coverEndDate = new Date(req.coverEndDate);
      }

      if (req.monthsOfCover) {
        this.monthsOfCover = Number(req.monthsOfCover);
      }

      if (req.details) {
        this.details = req.details;
      }

      if (req.detailsOther) {
        this.detailsOther = String(req.detailsOther);
      }

      if (req.currency) {
        this.currency = String(req.currency);
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

      if (req.paymentType) {
        this.paymentType = checkPaymentType(req.paymentType);
      }

      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Facility,
};
