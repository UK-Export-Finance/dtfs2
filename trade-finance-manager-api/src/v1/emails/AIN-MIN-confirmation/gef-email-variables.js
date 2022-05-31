const { format } = require('date-fns');
const { generateAddressString } = require('../../helpers/generate-address-string');
const getSubmissionDate = require('../../helpers/get-submission-date');
const { generateEligibilityCriteriaString } = require('../../helpers/generate-eligibility-criteria-string');
const { generateMandatoryCriteriaString } = require('../../helpers/generate-mandatory-criteria-string');

const gefEmailVariables = async (deal, facilityLists) => {
  const { submissionType, maker, exporter, bankInternalRefName, additionalRefName, ukefDealId } = deal;

  const { firstname, surname } = maker;
  const mandatoryCriteria = await generateMandatoryCriteriaString(deal.mandatoryVersionId);
  const emailVariables = {
    submissionType,
    firstname,
    surname,
    exporterName: exporter.companyName,
    ukefDealId,
    bankGefDealId: bankInternalRefName,
    dealName: additionalRefName || '-',
    submissionDate: format(getSubmissionDate(deal), 'do MMMM yyyy'),
    exporterCompaniesHouseRegistrationNumber: exporter.companiesHouseRegistrationNumber,
    exporterAddress: generateAddressString(exporter.registeredAddress),
    industrySector: exporter.selectedIndustry.name,
    industryClass: exporter.selectedIndustry.class?.name || exporter.selectedIndustry.class,
    smeType: exporter.smeType,
    probabilityOfDefault: exporter.probabilityOfDefault,
    cashFacilitiesList: facilityLists.cashes,
    contingentFacilitiesList: facilityLists.contingents,
    eligibilityCriteria: generateEligibilityCriteriaString(deal.eligibility.criteria),
    mandatoryCriteria,
  };

  return emailVariables;
};

module.exports = gefEmailVariables;
