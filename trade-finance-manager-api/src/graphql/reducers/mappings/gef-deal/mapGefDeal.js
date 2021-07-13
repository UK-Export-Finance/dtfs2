const mapGefDeal = (deal) => {
  // fields that need to be in GEF deal:
  //
  // submissionType(e.g 'Automatic', 'Manual')
  // submissionDate(timestamp)
  // ukefDealId(generated via API call on submission)
  // bankName
  // maker {
  //   firstname
  //   surname
  //   email
  // }
  // dealCurrency(e.g 'EUR')
  // dealValue(e.g 1234)
  // eligibility [
  //   {
  //     id: 'exporterDeclaration',
  //     answer: true,
  //     htmlText: '&lt;p&gt;15. The  Bank etc etc',
  //   }
  // ]

  const mapped = {
    _id: deal._id,
    dealSnapshot: {
      _id: deal._id,
      details: {
        ukefDealId: 'UKEF-ID-TODO',
        bankSupplyContractID: deal.dealSnapshot.bankInternalRefName,
        bankSupplyContractName: deal.dealSnapshot.additionalRefName,
        // submissionType
        // owningBank: {
        //   name
        // }
        // submissionDate
        // ukefDealId
        // maker: {
        //   firstname
        //   surname
        //   email
        // }
      },
      totals: {
        // TONY TO DO
        // need to look into facilities in GEF deal
        // facilitiesValueInGBP
        // facilitiesUkefExposure
      },
      facilities: [],
      submissionDetails: {
        supplierName: deal.dealSnapshot.exporter.companyName,
        supplierAddressLine1: deal.dealSnapshot.exporter.registeredAddress.addressLine1,
        supplierAddressLine2: deal.dealSnapshot.exporter.registeredAddress.addressLine2,
        supplierAddressLine3: deal.dealSnapshot.exporter.registeredAddress.addressLine3,
        supplierAddressTown: deal.dealSnapshot.exporter.registeredAddress.locality,
        supplierAddressPostcode: deal.dealSnapshot.exporter.registeredAddress.postalCode,
        supplierCountry: deal.dealSnapshot.exporter.registeredAddress.country,
        industrySector: deal.dealSnapshot.exporter.selectedIndustry.name,
        industryClass: deal.dealSnapshot.exporter.selectedIndustry.class.name,
        supplierCompaniesHouseRegistrationNumber: deal.dealSnapshot.exporter.companiesHouseRegistrationNumber,
        smeType: deal.dealSnapshot.exporter.smeType,
        // supplyContractCurrency
        // supplyContractValue
      },
      eligibilityCriteria: [],
      eligibility: {},
      dealFiles: {},
    },
    tfm: {},
  };

  return mapped;
};


module.exports = mapGefDeal;
