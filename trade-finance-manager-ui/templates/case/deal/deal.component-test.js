const pageRenderer = require('../../../component-tests/pageRenderer');

const page = '../templates/case/deal/deal.njk';
const render = pageRenderer(page);

const Chance = require('chance');

const chance = new Chance();

const params = {
  deal: {
    _id: chance.integer(),
    dealType: 'BSS/EWCS',
    submissionType: 'Automatic Inclusion Notice',
    bankInternalRefName: chance.string({ length: 5 }),
    additionalRefName: chance.word(),
    bank: {
      name: chance.name(),
      emails: [chance.email()],
    },
    maker: {
      firstname: chance.first(),
      surname: chance.last(),
      email: chance.email(),
    },
    submissionDetails: {
      supplierName: chance.name(),
      buyerName: chance.name(),
    },
  },
};

describe(`${page} when deal is BSS`, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render page title', () => {
    wrapper.expectText('[data-cy="page-title"]').toRead('Deal');
  });

  it('should render mga version', () => {
    wrapper.expectText('[data-cy="mga-version"]').toRead('January 2020');
  });

  it('should render bank', () => {
    wrapper.expectText('[data-cy="deal-bank"]').toRead(params.deal.bank.name);
  });

  it('should render contact name', () => {
    wrapper.expectText('[data-cy="contact-name"]').toRead(`${params.deal.maker.firstname} ${params.deal.maker.surname}`);
  });

  it('should render email', () => {
    wrapper.expectText('[data-cy="email"]').toRead(params.deal.maker.email);
  });

  it('should render bank reference', () => {
    wrapper.expectText('[data-cy="bank-reference"]').toRead(params.deal.bankInternalRefName);
  });

  it('should render bank additional reference', () => {
    wrapper.expectText('[data-cy="bank-additional-reference"]').toRead(params.deal.additionalRefName);
  });

  it('should render eligibility criteria answers', () => {
    wrapper.expectElement('[data-cy="eligibility-criteria-answers"]').toExist();
  });

  it('should render facilities table', () => {
    wrapper.expectElement('[data-cy="facilities-table"]').toExist();
  });

  it('should NOT render bank\'s financing to exporter', () => {
    wrapper.expectElement('[data-cy="finance-increasing"]').notToExist();
  });
});


describe(`${page} when deal is GEF`, () => {
  let wrapper;

  beforeEach(() => {
    params.deal.dealType = 'GEF';
    wrapper = render(params);
  });

  // TODO page title
  it('should render mga version', () => {
    wrapper.expectText('[data-cy="mga-version"]').toRead('January 2020');
  });

  it('should render bank', () => {
    wrapper.expectText('[data-cy="deal-bank"]').toRead(params.deal.bank.name);
  });

  it('should render contact name', () => {
    wrapper.expectText('[data-cy="contact-name"]').toRead(`${params.deal.maker.firstname} ${params.deal.maker.surname}`);
  });

  it('should render email', () => {
    wrapper.expectText('[data-cy="email"]').toRead(params.deal.maker.email);
  });

  it('should render bank reference', () => {
    wrapper.expectText('[data-cy="bank-reference"]').toRead(params.deal.bankInternalRefName);
  });

  it('should render bank additional reference', () => {
    wrapper.expectText('[data-cy="bank-additional-reference"]').toRead(params.deal.additionalRefName);
  });

  it('should render eligibility criteria answers', () => {
    wrapper.expectElement('[data-cy="eligibility-criteria-answers"]').toExist();
  });

  it('should render facilities table', () => {
    wrapper.expectElement('[data-cy="facilities-table"]').toExist();
  });

  it('should render bank\'s financing to exporter', () => {
    wrapper.expectElement('[data-cy="finance-increasing"]').toExist();
  });
});
