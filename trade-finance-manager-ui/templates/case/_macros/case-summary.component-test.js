const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/_macros/case-summary.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    _id: '12345678',
    submissionDetails: {
      supplierName: 'The Supplier name',
      buyerName: 'The Buyer name',
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render supplier name', () => {
    wrapper.expectElement('[data-cy="supplier-name"]').toExist();
    wrapper.expectText('[data-cy="supplier-name"]').toRead(params.submissionDetails.supplierName);
  });

  it('should render buyer name', () => {
    wrapper.expectElement('[data-cy="buyer-name"]').toExist();
    wrapper.expectText('[data-cy="buyer-name"]').toRead(params.submissionDetails.buyerName);
  });
});
