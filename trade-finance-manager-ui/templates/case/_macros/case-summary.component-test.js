const fs = require('fs');
const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/_macros/case-summary.njk';

const filterFormatDateString = require('../../../server/nunjucks-configuration/filter-formatDateString');

const formatDateString = filterFormatDateString.default;

const render = componentRenderer(component);

const rawdata = fs.readFileSync('templates/case/mock_data/deal.json');
let params = {
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
    dateReceived: '01-02-2021',
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

  it('should add `chevron-right` class to supplier column', () => {
    wrapper.expectElement('[data-cy="supplier-column"]').hasClass('case-summary-supplier chevron-right');
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

  it('should render total ukef exposure', () => {
    wrapper.expectText('[data-cy="total-ukef-exposure"]').toRead(params.deal.totals.facilitiesUkefExposure);
  });

  it('should render date received', () => {
    const expected = formatDateString(params.tfm.dateReceived, 'DD-MM-YYYY', 'D MMMM YYYY');
    wrapper.expectText('[data-cy="date-received"]').toRead(expected);
  });

  describe('when there is no buyerName', () => {
    beforeEach(() => {
      params = JSON.parse(JSON.stringify(params));
      delete params.deal.submissionDetails.buyerName;

      wrapper = render(params);
    });

    it('should NOT render buyerName column', () => {
      wrapper.expectElement('[data-cy="buyer-name-column"]').notToExist();
      wrapper.expectElement('[data-cy="buyer-name"]').notToExist();
    });

    it('should NOT add `chevron-right` class to supplier column', () => {
      wrapper.expectElement('[data-cy="supplier-column"]').hasClass('case-summary-supplier');
    });
  });

  describe('tier 1 exporter', () => {
    beforeEach(() => {
      params = JSON.parse(JSON.stringify(params));
      params.deal.submissionDetails.supplierType = 'UK Supplier';

      wrapper = render(params);
    });

    it('should render correct supplier type', () => {
      wrapper.expectText('[data-cy="case-summary"] [data-cy="supplier-type"]').toRead('Tier 1 supplier');
    });
  });
});
