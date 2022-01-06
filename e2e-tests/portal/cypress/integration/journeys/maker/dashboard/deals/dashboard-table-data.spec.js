const { dashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');
const mockUsers = require('../../../../../fixtures/mockUsers');

const BANK1_MAKER1 = mockUsers.find((user) =>
  (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

const BANK1_MAKER2 = mockUsers.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = mockUsers.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK2_MAKER2');

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View dashboard deals as a maker', () => {
  let ALL_BANK1_DEALS;
  let ALL_BANK2_DEALS;
  let gefDeal;
  let bssDeal;
  let gefDealId;
  let bssDealId;

  const ALL_DEALS = [];

  const BSS_DEAL = {
    dealType: 'BSS/EWCS',
    submissionType: 'Automatic Inclusion Notice',
    bankInternalRefName: 'Draft BSS',
    additionalRefName: 'Tibettan submarine acquisition scheme',
    status: 'Draft',
    exporter: {
      companyName: 'mock company',
    },
  };

  const GEF_DEAL = {
    dealType: 'GEF',
    bank: { id: BANK1_MAKER1.bank.id },
    bankInternalRefName: 'Draft GEF',
    status: 'Draft',
    exporter: {
      companyName: 'mock company',
    },
  };

  const GEF_DEAL_MAKER_2 = {
    ...GEF_DEAL,
    bank: { id: BANK1_MAKER2.bank.id },
    bankInternalRefName: 'Draft GEF Maker 2',
  };

  const GEF_DEAL_BANK_2_MAKER_2 = {
    ...GEF_DEAL,
    bank: { id: BANK2_MAKER2.bank.id },
    bankInternalRefName: 'Draft GEF Bank 2 Maker 2',
  };

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.listAllUsers().then((usersInDb) => {
      const maker = usersInDb.find((user) => user.username === BANK1_MAKER1.username);
      BSS_DEAL.maker = maker;
      GEF_DEAL.maker = maker;

      const maker2 = usersInDb.find((user) => user.username === BANK1_MAKER2.username);
      GEF_DEAL_MAKER_2.maker = maker2;
    });

    cy.insertOneGefApplication(GEF_DEAL, BANK1_MAKER1)
      .then((gefDeal) => {
        ALL_DEALS.push(gefDeal);
      });

    cy.insertOneDeal(BSS_DEAL, BANK1_MAKER1)
      .then((bssDeal) => {
        ALL_DEALS.push(bssDeal);
      });

    cy.insertOneGefApplication(GEF_DEAL_MAKER_2, BANK1_MAKER2)
      .then((gefDeal) => {
        ALL_DEALS.push(gefDeal);
      });

    cy.insertOneGefApplication(GEF_DEAL_BANK_2_MAKER_2, BANK1_MAKER2)
      .then((gefDeal) => {
        ALL_DEALS.push(gefDeal);
      });
  });

  beforeEach(() => {
    gefDeal = ALL_DEALS.find(({ dealType, status, maker }) =>
      dealType === 'GEF'
      && maker.username === BANK1_MAKER2.username);

    bssDeal = ALL_DEALS.find(({ dealType, status }) =>
      dealType === 'BSS/EWCS');

    gefDealId = gefDeal._id;
    bssDealId = bssDeal._id;

    ALL_BANK1_DEALS = ALL_DEALS.filter(({ bank }) => bank.id === BANK1_MAKER1.bank.id);
    ALL_BANK2_DEALS = ALL_DEALS.filter(({ bank }) => bank.id === BANK2_MAKER2.bank.id);
  });

  it('BSS and GEF deals render on the dashboard with correct values', () => {
    cy.login(BANK1_MAKER1);
    dashboard.visit();

    const {
      exporter,
      bankRef,
      product,
      status,
      type,
      updated,
    } = dashboard.row;

    // should see all deals in the maker's bank
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${ALL_BANK1_DEALS.length} items)`);
    });


    //---------------------------------------------------------------
    // first deal should be the most recent (with our test data - GEF)
    //---------------------------------------------------------------
    const firstRow = cy.get('table tr').eq(1);

    firstRow.find(`[data-cy="deal__status--${gefDeal._id}"]`).should('exist');

    exporter(gefDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(gefDeal.exporter.companyName);
    });

    bankRef(gefDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(gefDeal.bankInternalRefName);
    });

    product(gefDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(gefDeal.dealType);
    });

    type(gefDealId).invoke('text').then((text) => {
      expect(text.trim()).equal('-');
    });

    status(gefDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(gefDeal.status);
    });

    updated(gefDealId).invoke('text').then((text) => {
      expect(text.trim()).to.match(regexDateTime);
    });

    //---------------------------------------------------------------
    // second deal (BSS)
    //---------------------------------------------------------------
    const secondRow = cy.get('table tr').eq(2);

    firstRow.find(`[data-cy="deal__status--${bssDealId}"]`).should('exist');

    exporter(bssDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(bssDeal.exporter.companyName);
    });

    bankRef(bssDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(bssDeal.bankInternalRefName);
    });

    product(bssDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(bssDeal.dealType);
    });

    type(bssDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(bssDeal.submissionType);
    });

    status(bssDealId).invoke('text').then((text) => {
      expect(text.trim()).equal(bssDeal.status);
    });

    updated(bssDealId).invoke('text').then((text) => {
      expect(text.trim()).to.match(regexDateTime);
    });
  });

  it('deal links go to correct deal page/URL depending on dealType', () => {
    cy.login(BANK1_MAKER1);
    dashboard.visit();

    // GEF link
    dashboard.row.link(gefDealId).click();
    cy.url().should('eq', relative(`/gef/application-details/${gefDealId}`));


    // go back to the dashboard
    dashboard.visit();


    // BSS link
    dashboard.row.link(bssDealId).click();
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });

  it('selecting the `created by me` checkbox refreshes the page and shows only deals created by the logged in maker', () => {
    // login as Maker 2, go to dashboard
    cy.login(BANK1_MAKER2);
    dashboard.visit();


    // should see all deals in bank 1
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${ALL_BANK1_DEALS.length} items)`);
    });

    // select/submit `created by you` checkbox
    dashboard.createdByYouCheckbox().check();


    // should only see deals made by Maker 2.
    const DEALS_BY_MAKER_2 = ALL_BANK1_DEALS.filter(({ maker }) => maker.username === BANK1_MAKER2.username);

    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${DEALS_BY_MAKER_2.length} items)`);
    });

    // checkbox should be remain checked
    dashboard.createdByYouCheckbox().should('be.checked');
  });

  it('should not show deals created by other banks', () => {
    cy.login(BANK1_MAKER1);
    dashboard.visit();

    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal(`(${ALL_BANK1_DEALS.length} items)`);
    });

    const row = cy.get('table tr');

    row.find(`[data-cy="deal__status--${ALL_BANK2_DEALS[0]._id}"]`).should('not.exist');
  });
});
