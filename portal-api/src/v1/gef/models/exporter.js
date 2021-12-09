// TODO: remove this. Do we need to include any checks/data transforms in other places?
const { Address } = require('./address');
const { SME_TYPE } = require('../enums');

function checkSmeType(smeType) {
  if (smeType) {
    switch (smeType.toUpperCase()) {
      case SME_TYPE.MICRO:
      case SME_TYPE.SMALL:
      case SME_TYPE.MEDIUM:
      case SME_TYPE.NOT_SME:
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
      this.selectedIndustry = null;
      this.industries = null;
      this.smeType = null;
      this.probabilityOfDefault = null;
      this.isFinanceIncreasing = null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // update application
      if (req.companiesHouseRegistrationNumber != null) {
        const chrn = String(req.companiesHouseRegistrationNumber);
        this.companiesHouseRegistrationNumber = chrn;
      }
      if (req.companyName != null) {
        this.companyName = String(req.companyName);
      }

      if (req.registeredAddress != null) {
        this.registeredAddress = new Address(req.registeredAddress);
      }

      if (req.correspondenceAddress != null) {
        this.correspondenceAddress = new Address(req.correspondenceAddress);
      }

      if (req.selectedIndustry != null) {
        this.selectedIndustry = req.selectedIndustry;
      }

      if (req.industries != null) {
        this.industries = req.industries;
      }

      if (req.smeType != null) {
        this.smeType = checkSmeType(req.smeType);
      }

      if (req.probabilityOfDefault != null) {
        this.probabilityOfDefault = Number(req.probabilityOfDefault);
      }

      if (req.isFinanceIncreasing != null) {
        this.isFinanceIncreasing = Boolean(req.isFinanceIncreasing);
      }

      this.updatedAt = Date.now();
    }
  }
}

module.exports = {
  Exporter,
};
