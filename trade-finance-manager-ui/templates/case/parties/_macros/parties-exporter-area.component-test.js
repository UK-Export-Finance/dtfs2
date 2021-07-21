const pageRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/parties/_macros/parties-exporter-area.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    deal: {
      _id: '12345678',
      details: {
        submissionType: 'Automatic Inclusion Notice',
        bankSupplyContractID: 'contract-1',
        bankSupplyContractName: 'FirstContract',
        owningBank: {
          name: 'Lloyds',
          emails: ['xxx@yyy.com'],
        },
        maker: {
          firstname: 'John',
          surname: 'Doe',
          email: 'john.doe@exporter.com',
        },
      },
      submissionDetails: {
        supplierName: 'The Supplier name',
        buyerName: 'The Buyer name',
        supplyContractDescription: 'supplyContractDescription',
        destinationCountry: 'United Kingdom',
        supplyContractCurrency: 'GBP',
        supplyContractValue: '1234.85',
        buyerAddressCountry: 'United Kingdom',
        buyerAddressLine1: 'buyerAddressLine1',
        buyerAddressLine2: 'buyerAddressLine2',
        buyerAddressLine3: 'buyerAddressLine3',
        buyerAddressPostcode: 'buyerAddressPostcode',
        buyerAddressTown: 'buyerAddressTown',
        indemnifierAddressCountry: 'indemnifierAddressCountry',
        indemnifierAddressLine1: 'indemnifierAddressLine1',
        indemnifierAddressLine2: 'indemnifierAddressLine2',
        indemnifierAddressLine3: 'indemnifierAddressLine3',
        indemnifierAddressPostcode: 'indemnifierAddressPostcode',
        indemnifierAddressTown: 'indemnifierAddressTown',
        indemnifierCorrespondenceAddressCountry: 'indemnifierCorrespondenceAddressCountry',
        indemnifierCorrespondenceAddressLine1: 'indemnifierCorrespondenceAddressLine1',
        indemnifierCorrespondenceAddressLine2: 'indemnifierCorrespondenceAddressLine2',
        indemnifierCorrespondenceAddressLine3: 'indemnifierCorrespondenceAddressLine3',
        indemnifierCorrespondenceAddressPostcode: 'indemnifierCorrespondenceAddressPostcode',
        indemnifierCorrespondenceAddressTown: 'indemnifierCorrespondenceAddressTown',
        indemnifierName: 'Mock indemnifierName',
        industryClass: 'Licensed restaurants',
        industrySector: 'Accommodation and food service activities',
        supplierAddressCountry: 'United Kingdom',
        supplierCountry: 'United Kingdom',
        supplierAddressLine1: 'supplierAddressLine1',
        supplierAddressLine2: 'supplierAddressLine2',
        supplierAddressLine3: 'supplierAddressLine3',
        supplierAddressPostcode: 'supplierAddressPostcode',
        supplierAddressTown: 'supplierAddressTown',
        supplierCompaniesHouseRegistrationNumber: '12345678',
        supplierCorrespondenceAddressCountry: 'United Kingdom',
        supplierCorrespondenceAddressLine1: 'supplierCorrespondenceAddressLine1',
        supplierCorrespondenceAddressLine2: 'supplierCorrespondenceAddressLine2',
        supplierCorrespondenceAddressLine3: 'supplierCorrespondenceAddressLine3',
        supplierCorrespondenceAddressPostcode: 'supplierCorrespondenceAddressPostcode',
        supplierCorrespondenceAddressTown: 'supplierCorrespondenceAddressTown',
        smeType: 'Micro',
      },
      eligibility: {
        agentAddressCountry: 'United Kingdom',
        agentAddressLine1: 'ADDR 1',
        agentAddressLine2: 'Addr 2',
        agentAddressLine3: 'Addr 3',
        agentAddressPostcode: 'CF64 5SH',
        agentAddressTown: 'City',
        agentName: 'AGENT NAME',
      },
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render correct supplier type', () => {
    wrapper.expectText('[data-cy="parties-exporter"] [data-cy="supplier-type"]').toRead('Exporter');
  });

  it('should render exporter name', () => {
    wrapper
      .expectText('[data-cy="exporter-name"]')
      .toRead(params.deal.submissionDetails.supplierName);
  });
  it('should render industry class', () => {
    wrapper
      .expectText('[data-cy="industry-class"]')
      .toRead(params.deal.submissionDetails.industryClass);
  });
  it('should render industry sector', () => {
    wrapper.expectText('[data-cy="industry-sector"]').toRead(params.deal.submissionDetails.industrySector);
  });
  it('should render exporter address country', () => {
    wrapper
      .expectText('[data-cy="exporter-country"]')
      .toRead(params.deal.submissionDetails.supplierAddressCountry);
  });
  it('should render exporter country', () => {
    wrapper
      .expectText('[data-cy="exporter-country"]')
      .toRead(params.deal.submissionDetails.supplierCountry);
  });
  it('should render exporter address line 1', () => {
    wrapper
      .expectText('[data-cy="exporter-address"]')
      .toContain(params.deal.submissionDetails.supplierAddressLine1);
  });
  it('should render exporter address line 2', () => {
    wrapper
      .expectText('[data-cy="exporter-address"]')
      .toContain(params.deal.submissionDetails.supplierAddressLine2);
  });
  it('should render exporter address line 3', () => {
    wrapper
      .expectText('[data-cy="exporter-address"]')
      .toContain(params.deal.submissionDetails.supplierAddressLine3);
  });
  it('should render exporter address town', () => {
    wrapper
      .expectText('[data-cy="exporter-address"]')
      .toContain(params.deal.submissionDetails.supplierAddressTown);
  });
  it('should render exporter address postcode', () => {
    wrapper
      .expectText('[data-cy="exporter-address"]')
      .toContain(params.deal.submissionDetails.supplierAddressPostcode);
  });

  it('should render exporter companies house registration number', () => {
    wrapper
      .expectText('[data-cy="exporter-companies-house-registration-number"]')
      .toRead(params.deal.submissionDetails.supplierCompaniesHouseRegistrationNumber);
  });
  it('should render exporter correspondence address country', () => {
    wrapper
      .expectText('[data-cy="exporter-correspondence-address-country"]')
      .toRead(params.deal.submissionDetails.supplierCorrespondenceAddressCountry);
  });
  it('should render exporter correspondence address line 1', () => {
    wrapper
      .expectText('[data-cy="exporter-correspondence-address"]')
      .toContain(params.deal.submissionDetails.supplierCorrespondenceAddressLine1);
  });
  it('should render exporter correspondence address line 2', () => {
    wrapper
      .expectText('[data-cy="exporter-correspondence-address"]')
      .toContain(params.deal.submissionDetails.supplierCorrespondenceAddressLine2);
  });
  it('should render exporter correspondence address  line 3', () => {
    wrapper
      .expectText('[data-cy="exporter-correspondence-address"]')
      .toContain(params.deal.submissionDetails.supplierCorrespondenceAddressLine3);
  });
  it('should render exporter correspondence address town', () => {
    wrapper
      .expectText('[data-cy="exporter-correspondence-address"]')
      .toContain(params.deal.submissionDetails.supplierCorrespondenceAddressTown);
  });
  it('should render exporter correspondence address post code', () => {
    wrapper
      .expectText('[data-cy="exporter-correspondence-address"]')
      .toContain(params.deal.submissionDetails.supplierCorrespondenceAddressPostcode);
  });

  it('should render sme size', () => {
    wrapper
      .expectText('[data-cy="sme-size"]')
      .toRead(params.deal.submissionDetails.smeType);
  });

  describe('tier 1 exporter', () => {
    beforeEach(() => {
      const tier1Params = JSON.parse(JSON.stringify(params));
      tier1Params.deal.submissionDetails.supplierType = 'UK Supplier';

      wrapper = render(tier1Params);
    });

    it('should render correct supplier type', () => {
      wrapper.expectText('[data-cy="parties-exporter"] [data-cy="supplier-type"]').toRead('Tier 1 supplier');
    });
  });

  describe('when correspondence address line 1 does not exist', () => {
    beforeEach(() => {
      const paramsWithoutCorrespondenceAddressLine1 = JSON.parse(JSON.stringify(params));
      delete paramsWithoutCorrespondenceAddressLine1.deal.submissionDetails.supplierCorrespondenceAddressLine1;

      wrapper = render(paramsWithoutCorrespondenceAddressLine1);
    });

    it('should NOT render correspondence address', () => {
      wrapper.expectElement('[data-cy="exporter-correspondence-address"]').notToExist();
    });

    it('should NOT render correspondence address country', () => {
      wrapper.expectElement('[data-cy="exporter-correspondence-address-country"]').notToExist();
    });
  });
});
