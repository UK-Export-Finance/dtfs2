const { format } = require('date-fns');
const gefEmailVariables = require('./gef-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const { generateAddressString } = require('../../helpers/generate-address-string');
const getSubmissionDate = require('../../helpers/get-submission-date');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('generate AIN/MIN confirmation email variables - GEF', () => {
  const mockFacilityLists = {
    cashes: 'test',
    contingents: 'test',
  };

  it('should return object', () => {
    const mockSubmittedDeal = mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

    const result = gefEmailVariables(mockSubmittedDeal, mockFacilityLists);

    const expected = {
      submissionType: mockSubmittedDeal.submissionType,
      firstname: mockSubmittedDeal.maker.firstname,
      surname: mockSubmittedDeal.maker.surname,
      exporterName: mockSubmittedDeal.exporter.companyName,
      ukefDealId: mockSubmittedDeal.ukefDealId,
      bankGefDealId: mockSubmittedDeal.bankInternalRefName,
      dealName: mockSubmittedDeal.additionalRefName,
      submissionDate: format(getSubmissionDate(mockSubmittedDeal), 'do MMMM yyyy'),
      exporterCompaniesHouseRegistrationNumber: mockSubmittedDeal.exporter.companiesHouseRegistrationNumber,
      exporterAddress: generateAddressString(mockSubmittedDeal.exporter.registeredAddress),
      industrySector: mockSubmittedDeal.exporter.selectedIndustry.name,
      industryClass: mockSubmittedDeal.exporter.selectedIndustry.class,
      smeType: mockSubmittedDeal.exporter.smeType,
      probabilityOfDefault: mockSubmittedDeal.exporter.probabilityOfDefault,
      cashFacilitiesList: mockFacilityLists.cashes,
      contingentFacilitiesList: mockFacilityLists.contingents,
    };

    expect(result).toEqual(expected);
  });
});
