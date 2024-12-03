const mapGefSubmissionDetails = (dealSnapshot) => {
  const { exporter } = dealSnapshot;

  const mapped = {
    supplierName: exporter.companyName,
    supplierAddressLine1: exporter.registeredAddress.addressLine1,
    supplierAddressLine2: exporter.registeredAddress.addressLine2,
    supplierAddressLine3: exporter.registeredAddress.addressLine3,
    supplierAddressTown: exporter.registeredAddress.locality,
    supplierAddressPostcode: exporter.registeredAddress.postalCode,
    supplierCountry: exporter.registeredAddress.country,
    industrySector: exporter.selectedIndustry.name,
    industryClass: exporter.selectedIndustry.class.name,
    supplierCompaniesHouseRegistrationNumber: exporter.companiesHouseRegistrationNumber,
    smeType: exporter.smeType,
  };

  if (exporter.correspondenceAddress) {
    mapped.supplierCorrespondenceAddressLine1 = exporter.correspondenceAddress.addressLine1;
    mapped.supplierCorrespondenceAddressLine2 = exporter.correspondenceAddress.addressLine2;
    mapped.supplierCorrespondenceAddressLine3 = exporter.correspondenceAddress.addressLine3;
    mapped.supplierCorrespondenceAddressTown = exporter.correspondenceAddress.locality;
    mapped.supplierCorrespondenceAddressPostcode = exporter.correspondenceAddress.postalCode;
    mapped.supplierCorrespondenceAddressCountry = exporter.correspondenceAddress.country;
  }

  return mapped;
};

module.exports = mapGefSubmissionDetails;
