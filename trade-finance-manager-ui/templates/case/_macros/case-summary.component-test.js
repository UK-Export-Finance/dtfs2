const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/_macros/case-summary.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    _id: '12345678',
    details: {
      submissionType: 'Automatic Inclusion Notice',
      submissionDate: '1597067095109',
      owningBank: {
        name: 'Lloyds'
      }
    },
    submissionDetails: {
      supplierName: 'The Supplier name',
      buyerName: 'The Buyer name',
      destinationCountry: 'USA',
      supplyContractDescription: 'Lore ipsum...',
      supplyContractCurrency: 'USD',
      supplyContractValue: '5,000,000'
    },
  };

  beforeEach(() => {
    wrapper = render(params);
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
    wrapper.expectText('[data-cy="contract-value"]').toRead(params.submissionDetails.supplyContractCurrency + ' ' + params.submissionDetails.supplyContractValue);
  });


  it('should render submission type', () => {
    wrapper.expectText('[data-cy="submission-type"]').toRead(params.details.submissionType);
  });

  it('should render submission date', () => {
    wrapper.expectText('[data-cy="submission-date"]').toRead(params.details.submissionDate);
  });

  it('should render  bank name', () => {
    wrapper.expectText('[data-cy="bank-name"]').toRead(params.details.owningBank.name);
  });


  
});
