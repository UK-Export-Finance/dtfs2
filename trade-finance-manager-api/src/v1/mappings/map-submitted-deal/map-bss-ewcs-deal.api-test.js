const { PROBABILITY_OF_DEFAULT } = require('@ukef/dtfs2-common');
const mapBssEwcsDeal = require('./map-bss-ewcs-deal');
const { mapBssEwcsFacility } = require('./map-bss-ewcs-facility');
const { MOCK_BSS_EWCS_DEAL } = require('../../__mocks__/mock-deal');

describe('mappings - map submitted deal - mapBssEwcsDeal', () => {
  it('should return mapped deal', () => {
    const mockDeal = {
      dealSnapshot: MOCK_BSS_EWCS_DEAL,
      tfm: {
        probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE,
      },
    };

    const result = mapBssEwcsDeal(mockDeal);

    const {
      _id,
      dealType,
      submissionType,
      bankInternalRefName,
      additionalRefName,
      details,
      submissionDetails,
      bondTransactions,
      loanTransactions,
      eligibility,
      exporter,
      status,
      maker,
      supportingInformation,
    } = mockDeal.dealSnapshot;

    const { submissionCount, submissionDate, ukefDealId } = details;

    const expected = {
      _id,
      dealType,
      submissionType,
      bankInternalRefName,
      additionalRefName,
      submissionCount,
      submissionDate,
      status,
      ukefDealId,
      maker,
      exporter: {
        companyName: exporter.companyName,
        companiesHouseRegistrationNumber: submissionDetails['supplier-companies-house-registration-number'],
        probabilityOfDefault: Number(mockDeal.tfm.probabilityOfDefault),
        smeType: submissionDetails['sme-type'],
        registeredAddress: {
          addressLine1: submissionDetails['supplier-address-line-1'],
          addressLine2: submissionDetails['supplier-address-line-2'],
          locality: submissionDetails['supplier-address-town'],
          postalCode: submissionDetails['supplier-address-postcode'],
          country: submissionDetails['supplier-address-country'].name,
        },
        selectedIndustry: {
          name: submissionDetails['industry-sector'].name,
          class: submissionDetails['industry-class'].name,
          code: submissionDetails['industry-class'].code,
        },
      },
      buyer: {
        name: submissionDetails['buyer-name'],
        country: submissionDetails['buyer-address-country'],
      },
      indemnifier: {
        name: submissionDetails['indemnifier-name'],
      },
      dealCurrency: submissionDetails.supplyContractCurrency,
      dealValue: submissionDetails.supplyContractValue,
      destinationOfGoodsAndServices: submissionDetails.destinationOfGoodsAndServices,
      eligibility,
      supportingInformation,
      facilities: [
        ...bondTransactions.items.map((facility) => ({
          ...mapBssEwcsFacility(facility),
          coverEndDate: expect.any(Object), // date object
        })),
        ...loanTransactions.items.map((facility) => ({
          ...mapBssEwcsFacility(facility),
          coverEndDate: expect.any(Object), // date object
        })),
      ],
      tfm: mockDeal.tfm,
    };

    expect(result).toEqual(expected);
  });

  it('should return mapped deal when no PoD has been specified', () => {
    const mockDeal = {
      dealSnapshot: MOCK_BSS_EWCS_DEAL,
      tfm: {},
    };

    const result = mapBssEwcsDeal(mockDeal);

    const {
      _id,
      dealType,
      submissionType,
      bankInternalRefName,
      additionalRefName,
      details,
      submissionDetails,
      bondTransactions,
      loanTransactions,
      eligibility,
      exporter,
      status,
      maker,
      supportingInformation,
    } = mockDeal.dealSnapshot;

    const { submissionCount, submissionDate, ukefDealId } = details;

    const expected = {
      _id,
      dealType,
      submissionType,
      bankInternalRefName,
      additionalRefName,
      submissionCount,
      submissionDate,
      status,
      ukefDealId,
      maker,
      exporter: {
        companyName: exporter.companyName,
        companiesHouseRegistrationNumber: submissionDetails['supplier-companies-house-registration-number'],
        probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE,
        smeType: submissionDetails['sme-type'],
        registeredAddress: {
          addressLine1: submissionDetails['supplier-address-line-1'],
          addressLine2: submissionDetails['supplier-address-line-2'],
          locality: submissionDetails['supplier-address-town'],
          postalCode: submissionDetails['supplier-address-postcode'],
          country: submissionDetails['supplier-address-country'].name,
        },
        selectedIndustry: {
          name: submissionDetails['industry-sector'].name,
          class: submissionDetails['industry-class'].name,
          code: submissionDetails['industry-class'].code,
        },
      },
      buyer: {
        name: submissionDetails['buyer-name'],
        country: submissionDetails['buyer-address-country'],
      },
      indemnifier: {
        name: submissionDetails['indemnifier-name'],
      },
      dealCurrency: submissionDetails.supplyContractCurrency,
      dealValue: submissionDetails.supplyContractValue,
      destinationOfGoodsAndServices: submissionDetails.destinationOfGoodsAndServices,
      eligibility,
      supportingInformation,
      facilities: [
        ...bondTransactions.items.map((facility) => ({
          ...mapBssEwcsFacility(facility),
          coverEndDate: expect.any(Object), // date object
        })),
        ...loanTransactions.items.map((facility) => ({
          ...mapBssEwcsFacility(facility),
          coverEndDate: expect.any(Object), // date object
        })),
      ],
      tfm: {},
    };

    expect(result).toEqual(expected);
  });
});
