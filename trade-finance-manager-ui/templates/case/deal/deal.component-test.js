const pageRenderer = require('../../../component-tests/pageRenderer');
const page = '../templates/case/deal/deal.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  let params = {
    deal : {
      _id: '12345678',
      details: {
        submissionType: 'Automatic Inclusion Notice',
        bankSupplyContractId: 'contract-1',
        bankSupplyContractName: 'FirstContract',
        owningBank: {
          name: 'Lloyds'
        },
        maker: {
          firstname: 'John',
          surname: 'Doe',
          bank: {
            emails : ['xxx@yyy.com'] 
            }
        }
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
  it('should render mga version', () => {
    wrapper.expectText('[data-cy="mga-version"]').toRead('January 2020');
  });

  it('should render bank', () => {
    wrapper.expectText('[data-cy="deal-bank"]').toRead(params.deal.details.owningBank.name);
  });

  it('should render contact name', () => {
    wrapper.expectText('[data-cy="contact-name"]').toRead(params.deal.details.maker.firstname + ' ' + params.deal.details.maker.surname );
  });

  it('should render email', () => {
    wrapper.expectText('[data-cy="email"]').toRead(params.deal.details.maker.bank.emails[0] );
  });

  it('should render bank reference', () => {
    wrapper.expectText('[data-cy="bank-reference"]').toRead(params.deal.details.bankSupplyContractId );
  });

  it('should render bank additional reference', () => {
    wrapper.expectText('[data-cy="bank-additional-reference"]').toRead(params.deal.details.bankSupplyContractName );
  });

  

  
  it('should render eligibility criteria answers', () => {
    wrapper.expectElement('[data-cy="eligibility-criteria-answers"]').toExist();
  });

});
