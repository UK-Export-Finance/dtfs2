const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');
const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');

describe('mapGefSubmissionDetails', () => {
  const mockDeal = {
    _id: MOCK_GEF_DEAL._id,
    dealSnapshot: {
      ...MOCK_GEF_DEAL,
      facilities: [],
    },
    tfm: {},
  };

  it('should return mapped submission details', () => {
    const result = mapGefSubmissionDetails(mockDeal.dealSnapshot);

    const expected = {
      supplierName: mockDeal.dealSnapshot.exporter.companyName,
      supplierAddressLine1: mockDeal.dealSnapshot.exporter.registeredAddress.addressLine1,
      supplierAddressLine2: mockDeal.dealSnapshot.exporter.registeredAddress.addressLine2,
      supplierAddressLine3: mockDeal.dealSnapshot.exporter.registeredAddress.addressLine3,
      supplierAddressTown: mockDeal.dealSnapshot.exporter.registeredAddress.locality,
      supplierAddressPostcode: mockDeal.dealSnapshot.exporter.registeredAddress.postalCode,
      supplierCountry: mockDeal.dealSnapshot.exporter.registeredAddress.country,
      industrySector: mockDeal.dealSnapshot.exporter.selectedIndustry.name,
      industryClass: mockDeal.dealSnapshot.exporter.selectedIndustry.class.name,
      supplierCompaniesHouseRegistrationNumber: mockDeal.dealSnapshot.exporter.companiesHouseRegistrationNumber,
      smeType: mockDeal.dealSnapshot.exporter.smeType,
    };

    expect(result).toEqual(expected);
  });
});
