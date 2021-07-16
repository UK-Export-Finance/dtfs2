const mapGefSubmissionDetails = (dealSnapshot) => {
  const { exporter } = dealSnapshot;

  return {
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
    // supplyContractCurrency
    // supplyContractValue
  };
};

module.exports = mapGefSubmissionDetails;
