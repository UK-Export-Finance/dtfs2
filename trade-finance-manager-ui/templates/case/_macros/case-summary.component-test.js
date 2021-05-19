const fs = require('fs');
const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/_macros/case-summary.njk';
const render = componentRenderer(component);

const rawdata = fs.readFileSync('templates/case/mock_data/deal.json');
const params = {
  deal: {
    ...JSON.parse(rawdata),
    totals: {
      facilitiesValueInGBP: 'GBP 2,740.41',
      facilitiesUkefExposure: 'GBP 123,456.12',
    },
  },
  tfm: {
    supplyContractValueInGBP: 'GBP 123,456.78',
    stage: 'Confirmed',
  },
  user: {
    timezone: 'Europe/London',
  },
};

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render UKEF deal id', () => {
    wrapper.expectText('[data-cy="ukef-deal-id"]').toRead(params.deal.details.ukefDealId);
  });

  it('should render correct supplier type', () => {
    wrapper.expectText('[data-cy="case-summary"] [data-cy="supplier-type"]').toRead('Exporter');
  });

  it('should render supplier name', () => {
    wrapper.expectText('[data-cy="supplier-name"]').toRead(params.deal.submissionDetails.supplierName);
  });

  it('should render buyer name', () => {
    wrapper.expectText('[data-cy="buyer-name"]').toRead(params.deal.submissionDetails.buyerName);
  });

  it('should render ukef deal stage component', () => {
    wrapper.expectElement('[data-cy="ukef-deal-stage"]').toExist();
  });

  it('should render destination country', () => {
    wrapper.expectText('[data-cy="destination-country"]').toRead(params.deal.submissionDetails.destinationCountry);
  });

  it('should render export description', () => {
    wrapper.expectText('[data-cy="export-description"]').toRead(params.deal.submissionDetails.supplyContractDescription);
  });

  it('should render bank name', () => {
    wrapper.expectText('[data-cy="bank-name"]').toRead(params.deal.details.owningBank.name);
  });

  it('should render contract value', () => {
    wrapper.expectText('[data-cy="contract-value"]').toRead(`${params.deal.submissionDetails.supplyContractCurrency} 8,000,000.00`);
  });

  it('should render contract value', () => {
    wrapper.expectText('[data-cy="contract-value"]').toRead(`${params.deal.submissionDetails.supplyContractCurrency} 8,000,000.00`);
  });

  it('should render total facilities in GBP', () => {
    wrapper.expectText('[data-cy="total-facilities-in-gbp"]').toRead(params.deal.totals.facilitiesValueInGBP);
  });

  it('should render total facilities in GBP', () => {
    wrapper.expectText('[data-cy="total-ukef-exposure"]').toRead(params.deal.totals.facilitiesUkefExposure);
  });

  // it('should render submission date', () => {
  //   wrapper.expectText('[data-cy="submission-date"]').toRead(params.details.submissionDate);
  // });

  describe('tier 1 exporter', () => {
    beforeEach(() => {
      const tier1Params = JSON.parse(JSON.stringify(params));
      tier1Params.deal.submissionDetails.supplierType = 'UK Supplier';

      wrapper = render(tier1Params);
    });

    it('should render correct supplier type', () => {
      wrapper.expectText('[data-cy="case-summary"] [data-cy="supplier-type"]').toRead('Tier 1 supplier');
    });
  });
});
