const pageRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/parties/_macros/parties-agent-area.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    renderEditLink: true,
    deal: {
      _id: '12345678',
      dealType: 'BSS/EWCS',
      submissionType: 'Automatic Inclusion Notice',
      bankInternalRefName: 'contract-1',
      additionalRefName: 'FirstContract',
      bank: {
        name: 'Lloyds',
        emails: ['xxx@yyy.com'],
      },
      maker: {
        firstname: 'John',
        surname: 'Doe',
        email: 'john.doe@exporter.com',
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
        agentAddressCountry: {
          code: 'GBR',
          name: 'United Kingdom',
        },
        agentAddressLine1: 'ADDR 1',
        agentAddressLine2: 'Addr 2',
        agentAddressLine3: 'Addr 3',
        agentAddressPostcode: 'CF64 5SH',
        agentAddressTown: 'City',
        agentName: 'AGENT NAME',
      },
    },
  };

  it('should render agent address country', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="agent-address-country"]')
      .toRead(params.deal.eligibility.agentAddressCountry.name);
  });

  it('should render agent agentAddressLine1 in address', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="agent-address"]')
      .toContain(params.deal.eligibility.agentAddressLine1);
  });

  it('should render agent agentAddressLine2 in address', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="agent-address"]')
      .toContain(params.deal.eligibility.agentAddressLine2);
  });

  it('should render agent agentAddressLine3 in address', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="agent-address"]')
      .toContain(params.deal.eligibility.agentAddressLine3);
  });

  it('should render agent agentAddressTown in address', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="agent-address"]')
      .toContain(params.deal.eligibility.agentAddressTown);
  });

  it('should render agent agentAddressPostcode in address', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="agent-address"]')
      .toContain(params.deal.eligibility.agentAddressPostcode);
  });

  it('should render agent name', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="agent-name"]').toRead(params.deal.eligibility.agentName);
  });

  it('should render edit link', () => {
    wrapper = render(params);

    wrapper.expectElement('[data-cy="edit-party-link"]').toExist();
  });

  describe('when dealType is GEF', () => {
    const gefDeal = {
      ...params,
      deal: {
        ...params.deal,
        dealType: 'GEF',
      },
    };

    it('should NOT render edit link', () => {
      wrapper = render(gefDeal);

      wrapper.expectElement('[data-cy="edit-party-link"]').notToExist();
    });

    it('should render `Not applicable`', () => {
      wrapper = render(gefDeal);

      wrapper.expectElement('[data-cy="agent-not-applicable"]').toExist();
      wrapper.expectElement('[data-cy="agent-details"]').notToExist();
    });
  });
});
