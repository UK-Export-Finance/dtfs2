const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/_macros/case-summary.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    _id: '12345678',
    details: {
      submissionType: 'Automatic Inclusion Notice',
    },
    submissionDetails: {
      supplierName: 'The Supplier name',
      buyerName: 'The Buyer name',
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

  it('should render submission type', () => {
    wrapper.expectText('[data-cy="submission-type"]').toRead(params.details.submissionType);
  });
});
