const gefEmailVariables = require('./gef-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const { generateAddressString } = require('../../helpers/generate-address-string');
const CONSTANTS = require('../../../constants');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('generate AIN/MIN confirmation email variables - GEF', () => {
  let mockFacilityLists = {
    issued: 'test',
    unissued: 'test',
  };

  it('should return object', () => {
    const mockSubmittedDeal = mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

    const mockFacilityLists = {
      cash: 'test',
      contingent: 'test',
    };

    const result = gefEmailVariables(mockSubmittedDeal, mockFacilityLists);

    const expected = {
      submissionType: mockSubmittedDeal.submissionType,
      firstname: mockSubmittedDeal.maker.firstname,
      surname: mockSubmittedDeal.maker.surname,
      exporterName: mockSubmittedDeal.exporter.companyName,
      ukefDealId: mockSubmittedDeal.ukefDealId,
      dealName: mockSubmittedDeal.bankInternalRefName,
      submissionDate: mockSubmittedDeal.submissionDate,
      exporterCompaniesHouseRegistrationNumber: mockSubmittedDeal.exporter.companiesHouseRegistrationNumber,
      exporterName: mockSubmittedDeal.exporter.companyName,
      exporterAddress: generateAddressString(mockSubmittedDeal.exporter.registeredAddress),
      industrySector: mockSubmittedDeal.exporter.selectedIndustry.name,
      industryClass: mockSubmittedDeal.exporter.selectedIndustry.class.name,
      smeType: mockSubmittedDeal.exporter.smeType,
      probabilityOfDefault: mockSubmittedDeal.exporter.probabilityOfDefault,
      cashFacilitiesList: mockFacilityLists.cash,
      showCashFacilitiesHeader: 'yes',
      contingentFacilitiesList: mockFacilityLists.contingent,
      showContingentFacilitiesHeader: 'yes',
    };

    expect(result).toEqual(expected);
  });

  describe('when there are no cash or contingent facilities', () => {
    it('should return correct `show cash/contingent header` properties', () => {

      mockFacilityLists = {
        cash: '',
        contingent: '',
      };

      const mockSubmittedDeal = mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

      const result = gefEmailVariables(mockSubmittedDeal, mockFacilityLists);

      expect(result.showCashFacilitiesHeader).toEqual('no');
      expect(result.showContingentFacilitiesHeader).toEqual('no');
    });
  });
});
