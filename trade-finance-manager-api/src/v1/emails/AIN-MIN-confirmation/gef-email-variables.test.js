const { format } = require('date-fns');
const gefEmailVariables = require('./gef-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const { generateAddressString } = require('../../helpers/generate-address-string');
const getSubmissionDate = require('../../helpers/get-submission-date');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');
const api = require('../../api');

const getGefMandatoryCriteriaByVersion = jest.fn(() => Promise.resolve([]));
api.getGefMandatoryCriteriaByVersion = getGefMandatoryCriteriaByVersion;

describe('generate AIN/MIN confirmation email variables - GEF', () => {
  const mockFacilityLists = {
    cashes: 'test',
    contingents: 'test',
  };

  it('should return object', async () => {
    const mockSubmittedDeal = await mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

    const result = await gefEmailVariables(mockSubmittedDeal, mockFacilityLists);

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
      eligibilityCriteria: expect.any(String),
      mandatoryCriteria: expect.any(String),
    };

    expect(result).toEqual(expected);
  });

  describe('when there is no additionalRefName', () => {
    it('should return dealName as a dash', async () => {
      const mockDeal = MOCK_GEF_DEAL;
      delete mockDeal.additionalRefName;

      const mockSubmittedDeal = await mapSubmittedDeal({ dealSnapshot: mockDeal });

      const result = await gefEmailVariables(mockSubmittedDeal, mockFacilityLists);
      expect(result.dealName).toEqual('-');
    });
  });
});
