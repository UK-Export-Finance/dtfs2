const { format } = require('date-fns');
const { generateAddressString } = require('../../helpers/generate-address-string');

const gefEmailVariables = (deal, facilitiesList) => {
  const {
    submissionType,
    maker,
    exporter,
    bankInternalRefName,
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
    bankGefDealId: 'TODO', // TODO: "bank gef deal id" (need confirmaition)
    dealName: bankInternalRefName,
    submissionDate: format(Number(submissionDate), 'do, MMMM, yyyy'),
    exporterCompaniesHouseRegistrationNumber: exporter.companiesHouseRegistrationNumber,
    exporterName: exporter.companyName,
    exporterAddress: generateAddressString(exporter.registeredAddress),
    industrySector: exporter.selectedIndustry.name,
    industryClass: exporter.selectedIndustry.class.name,
    smeType: exporter.smeType,
    probabilityOfDefault: exporter.probabilityOfDefault,
    cashFacilitiesList: facilitiesList.cash,
    showCashFacilitiesHeader: facilitiesList.cash ? 'yes' : 'no',
    contingentFacilitiesList: facilitiesList.contingent,
    showContingentFacilitiesHeader: facilitiesList.contingent ? 'yes' : 'no',
  };

  return emailVariables;
};

module.exports = gefEmailVariables;
