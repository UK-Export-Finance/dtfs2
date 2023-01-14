const pageRenderer = require('../../component-tests/pageRenderer');

const page = '../templates/case/case.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    deal: {
      _id: '12345678',
      submissionType: 'Automatic Inclusion Notice',
      submissionDetails: {
        supplierName: 'The Supplier name',
        buyerName: 'The Buyer name',
      },
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('Non NDB deal', () => {
    params.tfm = {
      nonDelegatedBank: false,
    };

    it('should render case summary component', () => {
      wrapper.expectElement('[data-cy="case-summary-ndb"]').toExist();
    });

    it('should render case sub navigation', () => {
      wrapper.expectElement('[data-cy="case-sub-navigation"]').toExist();
    });
  });

  describe('NDB deal', () => {
    params.tfm = {
      nonDelegatedBank: true,
    };

    it('should render NDB case summary component', () => {
      wrapper.expectElement('[data-cy="case-summary-ndb"]').toExist();
    });

    it('should render case sub navigation', () => {
      wrapper.expectElement('[data-cy="case-sub-navigation"]').toExist();
    });
  });
});
