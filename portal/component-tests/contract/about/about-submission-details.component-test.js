const componentRenderer = require('../../componentRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'contract/about/components/about-submission-details.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const { submissionDetails } = deal;

  beforeEach(() => {
    wrapper = render(submissionDetails);
  });

  describe('supplier', () => {
    it('should render supplier-type', () => {
      wrapper.expectText('[data-cy="supplier-type"]').toRead(submissionDetails['supplier-type']);
    });

    it('should render supplier-name', () => {
      wrapper.expectText('[data-cy="supplier-name"]').toRead(submissionDetails['supplier-name']);
    });

    it('should render supplier-address-line-1', () => {
      wrapper.expectText('[data-cy="supplier-address-line-1"]').toRead(submissionDetails['supplier-address-line-1']);
    });

    it('should render supplier-address-line-2', () => {
      wrapper.expectText('[data-cy="supplier-address-line-2"]').toRead(submissionDetails['supplier-address-line-2']);
    });

    it('should render supplier-address-line-3', () => {
      wrapper.expectText('[data-cy="supplier-address-line-3"]').toRead(submissionDetails['supplier-address-line-3']);
    });

    it('should render supplier-address-town', () => {
      wrapper.expectText('[data-cy="supplier-address-town"]').toRead(submissionDetails['supplier-address-town']);
    });

    it('should render supplier-address-postcode', () => {
      wrapper.expectText('[data-cy="supplier-address-postcode"]').toRead(submissionDetails['supplier-address-postcode']);
    });

    it('should render supplier-address-country', () => {
      wrapper.expectText('[data-cy="supplier-address-country"]').toRead(submissionDetails['supplier-address-country'].name);
    });

    it('should render supplier-companies-house-registration-number', () => {
      wrapper.expectText('[data-cy="supplier-companies-house-registration-number"]').toRead(submissionDetails['supplier-companies-house-registration-number']);
    });
  });

  describe('supplier-correspondence', () => {
    it('should render supplier-correspondence-address-line-1', () => {
      wrapper.expectText('[data-cy="supplier-correspondence-address-line-1"]').toRead(submissionDetails['supplier-correspondence-address-line-1']);
    });

    it('should render supplier-correspondence-address-line-2', () => {
      wrapper.expectText('[data-cy="supplier-correspondence-address-line-2"]').toRead(submissionDetails['supplier-correspondence-address-line-2']);
    });

    it('should render supplier-correspondence-address-line-3', () => {
      wrapper.expectText('[data-cy="supplier-correspondence-address-line-3"]').toRead(submissionDetails['supplier-correspondence-address-line-3']);
    });

    it('should render supplier-correspondence-address-town', () => {
      wrapper.expectText('[data-cy="supplier-correspondence-address-town"]').toRead(submissionDetails['supplier-correspondence-address-town']);
    });

    it('should render supplier-correspondence-address-postcode', () => {
      wrapper.expectText('[data-cy="supplier-correspondence-address-postcode"]').toRead(submissionDetails['supplier-correspondence-address-postcode']);
    });

    it('should render supplier-correspondence-address-country', () => {
      wrapper.expectText('[data-cy="supplier-correspondence-address-country"]').toRead(submissionDetails['supplier-correspondence-address-country'].name);
    });
  });

  it('should render industry-sector', () => {
    wrapper.expectText('[data-cy="industry-sector"]').toRead(submissionDetails['industry-sector'].name);
  });

  it('should render industry-class', () => {
    wrapper.expectText('[data-cy="industry-class"]').toRead(submissionDetails['industry-class'].name);
  });

  it('should render sme-type', () => {
    wrapper.expectText('[data-cy="sme-type"]').toRead(submissionDetails['sme-type']);
  });

  it('should render supply-contract-description', () => {
    wrapper.expectText('[data-cy="supply-contract-description"]').toRead(submissionDetails['supply-contract-description']);
  });

  describe('indemnifier', () => {
    it('should render indemnifier-companies-house-registration-number', () => {
      wrapper
        .expectText('[data-cy="indemnifier-companies-house-registration-number"]')
        .toRead(submissionDetails['indemnifier-companies-house-registration-number']);
    });

    it('should render indemnifier-name', () => {
      wrapper.expectText('[data-cy="indemnifier-name"]').toRead(submissionDetails['indemnifier-name']);
    });

    it('should render indemnifier-address-line-1', () => {
      wrapper.expectText('[data-cy="indemnifier-address-line-1"]').toRead(submissionDetails['indemnifier-address-line-1']);
    });

    it('should render indemnifier-address-line-2', () => {
      wrapper.expectText('[data-cy="indemnifier-address-line-2"]').toRead(submissionDetails['indemnifier-address-line-2']);
    });

    it('should render indemnifier-address-line-3', () => {
      wrapper.expectText('[data-cy="indemnifier-address-line-3"]').toRead(submissionDetails['indemnifier-address-line-3']);
    });

    it('should render indemnifier-address-town', () => {
      wrapper.expectText('[data-cy="indemnifier-address-town"]').toRead(submissionDetails['indemnifier-address-town']);
    });

    it('should render indemnifier-address-postcode', () => {
      wrapper.expectText('[data-cy="indemnifier-address-postcode"]').toRead(submissionDetails['indemnifier-address-postcode']);
    });

    it('should render indemnifier-address-country', () => {
      wrapper.expectText('[data-cy="indemnifier-address-country"]').toRead(submissionDetails['indemnifier-address-country'].name);
    });
  });

  describe('indemnifier-correspondence', () => {
    it('should render indemnifier-correspondence-address-line-1', () => {
      wrapper.expectText('[data-cy="indemnifier-correspondence-address-line-1"]').toRead(submissionDetails['indemnifier-correspondence-address-line-1']);
    });

    it('should render indemnifier-correspondence-address-line-2', () => {
      wrapper.expectText('[data-cy="indemnifier-correspondence-address-line-2"]').toRead(submissionDetails['indemnifier-correspondence-address-line-2']);
    });

    it('should render indemnifier-correspondence-address-line-3', () => {
      wrapper.expectText('[data-cy="indemnifier-correspondence-address-line-3"]').toRead(submissionDetails['indemnifier-correspondence-address-line-3']);
    });

    it('should render indemnifier-correspondence-address-town', () => {
      wrapper.expectText('[data-cy="indemnifier-correspondence-address-town"]').toRead(submissionDetails['indemnifier-correspondence-address-town']);
    });

    it('should render indemnifier-correspondence-address-postcode', () => {
      wrapper.expectText('[data-cy="indemnifier-correspondence-address-postcode"]').toRead(submissionDetails['indemnifier-correspondence-address-postcode']);
    });

    it('should render indemnifier-correspondence-address-country', () => {
      wrapper.expectText('[data-cy="indemnifier-correspondence-address-country"]').toRead(submissionDetails['indemnifier-correspondence-address-country'].name);
    });
  });

  describe('buyer', () => {
    it('should render buyer-name', () => {
      wrapper.expectText('[data-cy="buyer-name"]').toRead(submissionDetails['buyer-name']);
    });

    it('should render buyer-address-line-1', () => {
      wrapper.expectText('[data-cy="buyer-address-line-1"]').toRead(submissionDetails['buyer-address-line-1']);
    });

    it('should render buyer-address-line-2', () => {
      wrapper.expectText('[data-cy="buyer-address-line-2"]').toRead(submissionDetails['buyer-address-line-2']);
    });

    it('should render buyer-address-line-3', () => {
      wrapper.expectText('[data-cy="buyer-address-line-3"]').toRead(submissionDetails['buyer-address-line-3']);
    });

    it('should render buyer-address-town', () => {
      wrapper.expectText('[data-cy="buyer-address-town"]').toRead(submissionDetails['buyer-address-town']);
    });

    it('should render buyer-address-postcode', () => {
      wrapper.expectText('[data-cy="buyer-address-postcode"]').toRead(submissionDetails['buyer-address-postcode']);
    });

    it('should render buyer-address-country', () => {
      wrapper.expectText('[data-cy="buyer-address-country"]').toRead(submissionDetails['buyer-address-country'].name);
    });
  });

  it('should render destinationOfGoodsAndServices', () => {
    wrapper.expectText('[data-cy="destinationOfGoodsAndServices"]').toRead(submissionDetails.destinationOfGoodsAndServices.name);
  });

  it('should render supplyContractValue', () => {
    wrapper.expectText('[data-cy="supplyContractValue"]').toRead(submissionDetails.supplyContractValue);
  });

  it('should render supplyContractCurrency', () => {
    wrapper.expectText('[data-cy="supplyContractCurrency"]').toRead(submissionDetails.supplyContractCurrency.text);
  });

  it('should render supplyContractConversionRateToGBP', () => {
    wrapper.expectText('[data-cy="supplyContractConversionRateToGBP"]').toRead(submissionDetails.supplyContractConversionRateToGBP);
  });

  it('should render supplyContractConversionDate', () => {
    wrapper.expectText('[data-cy="supplyContractConversionDate"]').toRead(submissionDetails.supplyContractConversionDate);
  });
});
