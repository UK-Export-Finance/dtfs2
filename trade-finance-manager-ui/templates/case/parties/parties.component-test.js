const pageRenderer = require('../../../component-tests/pageRenderer');

const page = '../templates/case/parties/parties.njk';
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
      },
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });


  it('should render bank', () => {
    wrapper.expectText('[data-cy="deal-bank"]').toRead(params.deal.details.owningBank.name);
  });
});
