const fs = require('fs');
const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/_macros/case-summary.njk';
const render = componentRenderer(component);

const rawdata = fs.readFileSync('templates/case/mock_data/deal.json');
const params = JSON.parse(rawdata);

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render UKEF deal id', () => {
    wrapper.expectText('[data-cy="ukef-deal-id"]').toRead(params.details.ukefDealId);
  });

  it('should render supplier name', () => {
    wrapper.expectText('[data-cy="supplier-name"]').toRead(params.submissionDetails.supplierName);
  });

  it('should render buyer name', () => {
    wrapper.expectText('[data-cy="buyer-name"]').toRead(params.submissionDetails.buyerName);
  });

  it('should render destination country', () => {
    wrapper.expectText('[data-cy="destination-country"]').toRead(params.submissionDetails.destinationCountry);
  });

  it('should render export description', () => {
    wrapper.expectText('[data-cy="export-description"]').toRead(params.submissionDetails.supplyContractDescription);
  });

  it('should render contract value', () => {
    wrapper.expectText('[data-cy="contract-value"]').toRead(`${params.submissionDetails.supplyContractCurrency} 8,000,000.00`);
  });


  it('should render submission type', () => {
    wrapper.expectText('[data-cy="submission-type"]').toRead(params.details.submissionType);
  });

  // it('should render submission date', () => {
  //   wrapper.expectText('[data-cy="submission-date"]').toRead(params.details.submissionDate);
  // });

  it('should render  bank name', () => {
    wrapper.expectText('[data-cy="bank-name"]').toRead(params.details.owningBank.name);
  });
});
