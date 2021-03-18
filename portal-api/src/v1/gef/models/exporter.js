const { Address } = require('./address');

class Exporter {
  constructor(req) {
    if (!req) {
      // new application
      this.companiesHouseRegistrationNumber = null;
      this.companyName = null;
      this.registeredAddress = null;
      this.correspondenceAddress = null;
      this.industrySector = null;
      this.industrySectorId = null;
      this.industryClass = null;
      this.industryClassId = null;
      this.smeType = null;
      this.probabilityOfDefault = null;
      this.isFinanceIncreasing = null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // update application
      const chrn = req.companiesHouseRegistrationNumber ? String(req.companiesHouseRegistrationNumber) : null;
      this.companiesHouseRegistrationNumber = chrn;
      this.companyName = req.companyName ? String(req.companyName) : null;
      this.registeredAddress = req.registeredAddress ? new Address(req.registeredAddress) : null;
      this.correspondenceAddress = req.correspondenceAddress ? new Address(req.correspondenceAddress) : null;
      this.industrySector = req.industrySectorId != null ? String(req.industrySectorId) : null;
      this.industrySectorId = req.industrySectorId != null ? Number(req.industrySectorId) : null;
      this.industryClass = req.industryClassId != null ? String(req.industryClassId) : null;
      this.industryClassId = req.industryClassId != null ? Number(req.industryClassId) : null;
      this.smeType = req.smeType != null ? String(req.smeTypeId) : null;
      this.probabilityOfDefault = req.probabilityOfDefault != null ? Number(req.probabilityOfDefault) : null;
      this.isFinanceIncreasing = req.isFinanceIncreasing != null ? Boolean(req.isFinanceIncreasing) : null;
      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Exporter,
};
