const mapGefDeal = (deal) => {
  const mapped = {
    _id: deal._id,
    dealSnapshot: {
      _id: deal._id,
      details: {
        ukefDealId: 'UKEF-ID-TODO',
        bankSupplyContractID: deal.dealSnapshot.bankInternalRefName,
        bankSupplyContractName: deal.dealSnapshot.additionalRefName,
        // currently not in GEF data:
        //
        // submissionType
        // owningBank: {
        //   name
        // }
        // submissionDate
        // ukefDealId
        // might need to get maker details on submission
        // so it's not stored in the GEF deal.
        // maker: {
        //   fistname
        //   surname
        //   email
        // }      
      },
      totals: {
        // need to look into facilities in GEF deal
        // facilitiesValueInGBP
        // facilitiesUkefExposure
      },
      facilities: [],
      submissionDetails: {
        // supplierType: 'HELLOOO TONY 123',
        supplierName: deal.dealSnapshot.exporter.companyName,
        // currently not in GEF data:
        // supplierType (TFM label is either "Exporter" or "Tier 1 supplier")
        // buyerName
        // supplyContractDescription ("Export description")
        // supplyContractCurrency ("Export contract value")

        // unsure what to use
        // destinationCountry ("Destination country") < should this be exporter.registeredAddress.country?
      },
      // TODO: all eligibility (is this coverTerms in GEF?)
      eligibilityCriteria: [],
      eligibility: {
        // currently not in GEF data / unsure what to use:
        // agentName
      },
      dealFiles: {},
    },
    // tfm object will be created when submitted to TFM
    tfm: {
      // stage
      // dateReceived
      //
      // TODO: for all deals -
      // TFM case summary should use dateReceived, not details.submissionDate
    },
  };

  return mapped;
};


module.exports = mapGefDeal;
