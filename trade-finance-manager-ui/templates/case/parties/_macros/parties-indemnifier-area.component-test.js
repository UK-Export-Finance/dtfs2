const pageRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/parties/_macros/parties-indemnifier-area.njk';
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
        legallyDistinct: 'Yes',
        indemnifierCompaniesHouseRegistrationNumber: 'indemnifierCompaniesHouseRegistrationNumber',
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

  it('should render indemnifier address country', () => {
    wrapper
      .expectText('[data-cy="indemnifier-address-country"]')
      .toRead(params.deal.submissionDetails.indemnifierAddressCountry);
  });
  it('should render indemnifier indemnifierAddressLine1 in address', () => {
    wrapper
      .expectText('[data-cy="indemnifier-address"]')
      .toContain(params.deal.submissionDetails.indemnifierAddressLine1);
  });
  it('should render indemnifier indemnifierAddressLine2 in address', () => {
    wrapper
      .expectText('[data-cy="indemnifier-address"]')
      .toContain(params.deal.submissionDetails.indemnifierAddressLine2);
  });
  it('should render indemnifier indemnifierAddressLine3 in address', () => {
    wrapper
      .expectText('[data-cy="indemnifier-address"]')
      .toContain(params.deal.submissionDetails.indemnifierAddressLine3);
  });
  it('should render indemnifier indemnifierAddressTown in address', () => {
    wrapper
      .expectText('[data-cy="indemnifier-address"]')
      .toContain(params.deal.submissionDetails.indemnifierAddressTown);
  });
  it('should render indemnifier indemnifierAddressPostcode in address', () => {
    wrapper
      .expectText('[data-cy="indemnifier-address"]')
      .toContain(params.deal.submissionDetails.indemnifierAddressPostcode);
  });

  it('should render indemnifier name', () => {
    wrapper
      .expectText('[data-cy="indemnifier-name"]')
      .toRead(params.deal.submissionDetails.indemnifierName);
  });

  it('should render indemnifier companies house no', () => {
    wrapper
      .expectText('[data-cy="indemnifier-companies-house-registration-number"]')
      .toRead(params.deal.submissionDetails.indemnifierCompaniesHouseRegistrationNumber);
  });

  it('should render indemnifier legally distinct', () => {
    wrapper
      .expectText('[data-cy="indemnifier-legally-distinct"]')
      .toRead(params.deal.submissionDetails.legallyDistinct);
  });
});
