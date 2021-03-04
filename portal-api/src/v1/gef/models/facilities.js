class Facility {
  constructor(req) {
    if (req.applicationId) {
      // new application
      this.applicationId = req.applicationId ? req.applicationId : null;
      this.type = req.type !== null ? Number(req.type) : null; // 0 Cash | 1 Contingent
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
      this.hasBeenIssued = req.hasBeenIssued != null ? Boolean(req.hasBeenIssued) : null;
      this.name = req.name ? String(req.name) : null;
      this.startOnDayOfNotice = req.startOnDayOfNotice != null ? Boolean(req.startOnDayOfNotice) : null;
      this.coverStartDate = req.coverStartDate ? new Date(req.coverStartDate) : null;
      this.coverEndDate = req.coverStartDate ? new Date(req.coverStartDate) : null;
      this.monthsOfCover = req.monthsOfCover ? Number(req.monthsOfCover) : null;
      this.details = req.details ? req.details : null;
      this.detailsOther = req.detailsOther ? String(req.detailsOther) : null;
      this.currency = req.currency ? String(req.currency) : null;
      this.value = req.value != null ? Number(req.value) : null;
      this.coverPercentage = req.coverPercentage != null ? Number(req.coverPercentage) : null;
      this.interestPercentage = req.interestPercentage != null ? Number(req.interestPercentage) : null;
      // 0 - In advance (quarterly) | 1 - In Arrears (quarterly)
      this.paymentType = req.paymentType != null ? Number(req.paymentType) : null;
      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Facility,
};
