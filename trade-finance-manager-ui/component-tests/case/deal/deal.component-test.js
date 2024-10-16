const Chance = require('chance');

const { pageRenderer } = require('../../pageRenderer');

const page = '../templates/case/deal/deal.njk';
const render = pageRenderer(page);

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
    supportingInformation: {
      securityDetails: {
        exporter: 'mock security',
      },
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

  it('should render bank header', () => {
    wrapper.expectText('[data-cy="deal-bank-details-ukef-heading"]').toRead('Bank application or notice');
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

  it("should NOT render bank's financing to exporter", () => {
    wrapper.expectElement('[data-cy="finance-increasing"]').notToExist();
  });

  it("should render bank's security details", () => {
    wrapper.expectElement('[data-cy="deal-bank-security-details"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-text"]').toExist();
  });
});

describe(`${page} when deal is GEF`, () => {
  let wrapper;

  beforeEach(() => {
    params.deal.dealType = 'GEF';
    params.deal.supportingInformation.securityDetails.facility = 'test';
    wrapper = render(params);
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

  it("should render bank's financing to exporter", () => {
    wrapper.expectElement('[data-cy="finance-increasing"]').toExist();
  });

  it("should render bank's security details", () => {
    wrapper.expectElement('[data-cy="deal-bank-security-details"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-sub-heading"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-text"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-facility-sub-heading"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-facility-text"]').toExist();
  });
});

describe(`${page} when deal is NDB`, () => {
  let wrapper;

  beforeEach(() => {
    params.tfm = {
      nonDelegatedBank: true,
    };
    wrapper = render(params);
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

  it('should not render eligibility criteria answers', () => {
    wrapper.expectElement('[data-cy="eligibility-criteria-answers"]').notToExist();
  });

  it('should render facilities table', () => {
    wrapper.expectElement('[data-cy="facilities-table"]').toExist();
  });

  it("should render bank's financing to exporter", () => {
    wrapper.expectElement('[data-cy="finance-increasing"]').toExist();
  });

  it("should render bank's security details", () => {
    wrapper.expectElement('[data-cy="deal-bank-security-details"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-sub-heading"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-text"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-facility-sub-heading"]').toExist();
    wrapper.expectElement('[data-cy="bank-security-facility-text"]').toExist();
  });
});

describe(`${page} cancel deal button`, () => {
  let wrapper;

  describe(`when showDealCancelButton is true and hasDraftCancellation is false`, () => {
    const dealId = '123';

    beforeEach(() => {
      params.showDealCancelButton = true;
      params.hasDraftCancellation = false;
      params.dealId = dealId;
      wrapper = render(params);
    });

    it("should render the 'Cancel deal' button", () => {
      wrapper.expectElement('[data-cy="cancel-deal-button"]').toExist();
      wrapper.expectText('[data-cy="cancel-deal-button"]').toRead('Cancel deal');
    });

    it("should have the correct link attribute on the 'Cancel deal' button", () => {
      wrapper.expectElement('[data-cy="cancel-deal-button"]').toHaveAttribute('href', `/case/${dealId}/cancellation/reason`);
    });
  });

  describe(`when showDealCancelButton is true and hasDraftCancellation is true`, () => {
    const dealId = '123';

    beforeEach(() => {
      params.showDealCancelButton = true;
      params.hasDraftCancellation = true;
      params.dealId = dealId;
      wrapper = render(params);
    });

    it("should render the 'Continue with deal cancellation' button", () => {
      wrapper.expectElement('[data-cy="cancel-deal-button"]').toExist();
      wrapper.expectText('[data-cy="cancel-deal-button"]').toRead('Continue with deal cancellation');
    });

    it("should have the correct link attribute on the 'Continue with deal cancellation' button", () => {
      wrapper.expectElement('[data-cy="cancel-deal-button"]').toHaveAttribute('href', `/case/${dealId}/cancellation/reason`);
    });
  });

  describe(`when showDealCancelButton is false`, () => {
    beforeEach(() => {
      params.showDealCancelButton = false;
      wrapper = render(params);
    });

    it("should not render the 'Cancel deal' button", () => {
      wrapper.expectElement('[data-cy="cancel-deal-button"]').notToExist();
    });
  });
});
