class CoverTerms {
  constructor(req) {
    if (!req) {
      // new application
      this.coverStart = null;
      this.noticeDate = null;
      this.facilityLimit = null;
      this.exporterDeclaration = null;
      this.dueDiligence = null;
      this.facilityLetter = null;
      this.facilityBaseCurrency = null;
      this.facilityPaymentCurrency = null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // update application
      this.coverStart = req.coverStart;
      this.noticeDate = req.noticeDate;
      this.facilityLimit = req.facilityLimit;
      this.exporterDeclaration = req.exporterDeclaration;
      this.dueDiligence = req.dueDiligence;
      this.facilityLetter = req.facilityLetter;
      this.facilityBaseCurrency = req.facilityBaseCurrency;
      this.facilityPaymentCurrency = req.facilityPaymentCurrency;

      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  CoverTerms,
};
