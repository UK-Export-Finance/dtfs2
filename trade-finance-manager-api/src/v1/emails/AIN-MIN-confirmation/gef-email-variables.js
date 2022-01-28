const { format } = require('date-fns');
const { generateAddressString } = require('../../helpers/generate-address-string');

const gefEmailVariables = (deal, facilityLists) => {
  const {
    submissionType,
    maker,
    exporter,
    name,
    bankAdditionalReferenceName,
    submissionDate,
    ukefDealId,
  } = deal;

  const { firstname, surname } = maker;

  const emailVariables = {
    submissionType,
    firstname,
    surname,
    exporterName: exporter.companyName,
    ukefDealId,
    bankGefDealId: name,
    dealName: bankAdditionalReferenceName,
    submissionDate: format(Number(submissionDate), 'do MMMM yyyy'),
    exporterCompaniesHouseRegistrationNumber: exporter.companiesHouseRegistrationNumber,
    exporterAddress: generateAddressString(exporter.registeredAddress),
    industrySector: exporter.selectedIndustry.name,
    industryClass: exporter.selectedIndustry.class,
    smeType: exporter.smeType,
    probabilityOfDefault: exporter.probabilityOfDefault,
    cashFacilitiesList: facilityLists.cashes,
    contingentFacilitiesList: facilityLists.contingents,
  };

  return emailVariables;
};

module.exports = gefEmailVariables;
