const { Address } = require('./address');

function checkSmeType(smeType) {
  if (smeType) {
    switch (smeType.toUpperCase()) {
      case 'MICRO':
      case 'SMALL':
      case 'MEDIUM':
      case 'NOT_SME':
        return smeType.toUpperCase();
      default:
        return null;
    }
  } else {
    return null;
  }
}
class Exporter {
  constructor(req) {
    if (!req) {
      // new application
      this.companiesHouseRegistrationNumber = null;
      this.companyName = null;
      this.registeredAddress = null;
      this.correspondenceAddress = null;
      this.industrySector = null;
      this.industryClass = null;
      this.smeType = null;
      this.probabilityOfDefault = null;
      this.isFinanceIncreasing = null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // update application
      if (req.companiesHouseRegistrationNumber) {
        const chrn = String(req.companiesHouseRegistrationNumber);
        this.companiesHouseRegistrationNumber = chrn;
      }
      if (req.companyName) {
        this.companyName = String(req.companyName);
      }

      if (req.registeredAddress) {
        this.registeredAddress = new Address(req.registeredAddress);
      }

      if (req.correspondenceAddress) {
        this.correspondenceAddress = new Address(req.correspondenceAddress);
      }

      if (req.industrySector) {
        this.industrySector = String(req.industrySector);
      }

      if (req.industryClass) {
        this.industryClass = String(req.industryClass);
      }

      if (req.smeType) {
        this.smeType = checkSmeType(req.smeType);
      }

      if (req.probabilityOfDefault) {
        this.probabilityOfDefault = Number(req.probabilityOfDefault);
      }

      if (req.isFinanceIncreasing) {
        this.isFinanceIncreasing = Boolean(req.isFinanceIncreasing);
      }

      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Exporter,
};
