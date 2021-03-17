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
      this.registeredAddress = req.registeredAddress ? new Address(req.registeredAddress) : null;
      this.correspondenceAddress = req.correspondenceAddress ? new Address(req.correspondenceAddress) : null;
      this.industrySectorId = req.industrySectorId != null ? Number(req.industrySectorId) : null;
      this.industryClassId = req.industryClassId != null ? Number(req.industryClassId) : null;
      this.smeTypeId = req.smeTypeId != null ? Number(req.smeTypeId) : null;
      this.probabilityOfDefault = req.probabilityOfDefault != null ? Number(req.probabilityOfDefault) : null;
      this.isFinanceIncreasing = req.isFinanceIncreasing != null ? Boolean(req.isFinanceIncreasing) : null;
      this.updatedAt = Date.now();
    }
  }
}

class Address {
  organisation_name = null;
  address_line_1 = null;
  address_line_2 = null;
  locality = null;
  postal_code = null;
  country = null;
  constructor(address) {
    this.organisation_name = address.organisation_name;
    this.address_line_1 = address.address_line_1;
    this.address_line_2 = address.address_line_2;
    this.locality = address.locality;
    this.postal_code = address.postal_code;
    this.country = address.country;
  }
}

module.exports = {
  Exporter,
};
