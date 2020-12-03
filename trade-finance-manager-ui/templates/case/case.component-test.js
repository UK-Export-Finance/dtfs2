const pageRenderer = require('../../component-tests/pageRenderer');
const page = '../templates/case/case.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  let params = {
    deal : {
      _id: '12345678',
      details: {
        submissionType: 'Automatic Inclusion Notice',
      },
      submissionDetails: {
        supplierName: 'The Supplier name',
        buyerName: 'The Buyer name',
      },
    }
  };

  beforeEach(() => {
    wrapper = render(params);
  });
  
  // TODO page title

  it('should render case summary component', () => {
    wrapper.expectElement(`[data-cy="case-summary-${params.deal._id}"]`).toExist();
  });

  it('should render case sub navigation', () => {
    wrapper.expectElement('[data-cy="case-sub-navigation"]').toExist();
  });

});
