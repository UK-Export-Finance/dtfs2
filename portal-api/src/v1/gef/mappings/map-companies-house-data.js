const mapCompaniesHouseData = (data, industries) => {
  const address = data.registered_office_address;

  let selectedIndustry = null;
  if (industries && industries.length === 1) {
    [selectedIndustry] = industries;
  }
  // If country is not available set it to UK as default
  const mapped = {
    companiesHouseRegistrationNumber: data.company_number,
    companyName: data.company_name,
    registeredAddress: {
      organisationName: address.organisation_name,
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2,
      addressLine3: address.address_line_3,
      locality: address.locality,
      postalCode: address.postal_code,
      country: !address.country ? 'United Kingdom' : address.country,
    },
    selectedIndustry,
    industries,
  };

  return mapped;
};

module.exports = mapCompaniesHouseData;
