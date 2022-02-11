const { format } = require('date-fns');
const { generateAddressString } = require('../../helpers/generate-address-string');
const getSubmissionDate = require('../../helpers/get-submission-date');

const gefEmailVariables = (deal, facilityLists) => {
  const {
    submissionType,
    maker,
    exporter,
    bankInternalRefName,
    additionalRefName,
    ukefDealId,
  } = deal;

  const { firstname, surname } = maker;

  const emailVariables = {
    submissionType,
    firstname,
    surname,
    exporterName: exporter.companyName,
    ukefDealId,
    bankGefDealId: bankInternalRefName,
    dealName: additionalRefName,
    submissionDate: format(getSubmissionDate(deal), 'do MMMM yyyy'),
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
