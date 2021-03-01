class Exporter {
  constructor(req) {
    if (!req) {
      // new application
      this.companiesHouseRegistrationNumber = null;
      this.companyName = null;
      this.registeredAddress = null;
      this.correspondenceAddress = null;
      this.industrySectorId = null;
      this.industryClassId = null;
      this.smeTypeId = null;
      this.probabilityOfDefault = null;
      this.isFinanceIncreasing = null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // update application
      const chrn = req.companiesHouseRegistrationNumber ? Number(req.companiesHouseRegistrationNumber) : null;
      this.companiesHouseRegistrationNumber = chrn;
      this.companyName = req.companyName ? String(req.companyName) : null;
      this.registeredAddress = req.registeredAddress ? req.registeredAddress : null;
      this.correspondenceAddress = req.correspondenceAddress ? req.correspondenceAddress : null;
      this.industrySectorId = req.industrySectorId ? Number(req.industrySectorId) : null;
      this.industryClassId = req.industryClassId ? Number(req.industryClassId) : null;
      this.smeTypeId = req.smeTypeId ? Number(req.smeTypeId) : null;
      this.probabilityOfDefault = req.probabilityOfDefault ? Number(req.probabilityOfDefault) : null;
      this.isFinanceIncreasing = req.isFinanceIncreasing ? Boolean(req.isFinanceIncreasing) : null;
      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Exporter,
};
