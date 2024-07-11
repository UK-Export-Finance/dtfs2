const relative = require('../../../../relativeURL');
const { dashboardDeals } = require('../../../../pages');
// MOCK_USERS
const CONSTANTS = require('../../../../../fixtures/constants');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { MOCK_DEALS } = require('../fixtures');

const { BANK1_MAKER1, BANK1_MAKER2, BANK2_MAKER2, ADMIN } = MOCK_USERS;

const { BSS_DEAL, GEF_DEAL, GEF_DEAL_MAKER_2, GEF_DEAL_BANK_2_MAKER_2 } = MOCK_DEALS;

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View dashboard deals as a maker', () => {
  let ALL_BANK1_DEALS;
  let ALL_BANK2_DEALS;
  let gefDeal;
  let bssDeal;
  let gefDealId;
  let bssDealId;

  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.listAllUsers(ADMIN).then((usersInDb) => {
      const maker = usersInDb.find((user) => user.username === BANK1_MAKER1.username);
      BSS_DEAL.maker = maker;
      GEF_DEAL.maker = maker;

      const maker2 = usersInDb.find((user) => user.username === BANK1_MAKER2.username);
      GEF_DEAL_MAKER_2.maker = maker2;
    });

    cy.insertOneGefApplication(GEF_DEAL, ADMIN).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL, ADMIN).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_MAKER_2, ADMIN).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_BANK_2_MAKER_2, ADMIN).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  beforeEach(() => {
    gefDeal = ALL_DEALS.find(({ dealType, maker }) => dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF && maker.username === ADMIN.username);

    bssDeal = ALL_DEALS.find(({ dealType }) => dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);

    gefDealId = gefDeal._id;
    bssDealId = bssDeal._id;

    ALL_BANK1_DEALS = ALL_DEALS.filter(({ bank }) => bank.id === BANK1_MAKER1.bank.id);
    ALL_BANK2_DEALS = ALL_DEALS.filter(({ bank }) => bank.id === BANK2_MAKER2.bank.id);
  });

  it('BSS and GEF deals render on the dashboard with correct values', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    const { exporter, bankRef, product, status, type, updated } = dashboardDeals.row;

    // should see all deals in the maker's bank
    dashboardDeals
      .totalItems()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(`(${ALL_BANK1_DEALS.length} items)`);
      });

    //---------------------------------------------------------------
    // first deal should be the most recently updated (with our test data - GEF)
    //---------------------------------------------------------------

    cy.get('table tr').eq(1).as('firstRow').find(`[data-cy="deal__status--${gefDeal._id}"]`).should('exist');

    exporter(gefDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(gefDeal.exporter.companyName);
      });

    bankRef(gefDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(gefDeal.bankInternalRefName);
      });

    product(gefDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(gefDeal.dealType);
      });

    type(gefDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('-');
      });

    status(gefDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(gefDeal.status);
      });

    updated(gefDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(regexDateTime);
      });

    //---------------------------------------------------------------
    // second deal (BSS)
    //---------------------------------------------------------------
    cy.get('table tr').eq(2).find(`[data-cy="deal__status--${bssDealId}"]`).should('exist');

    exporter(bssDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(bssDeal.exporter.companyName);
      });

    bankRef(bssDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(bssDeal.bankInternalRefName);
      });

    product(bssDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(bssDeal.dealType);
      });

    type(bssDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(bssDeal.submissionType);
      });

    status(bssDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(bssDeal.status);
      });

    updated(bssDealId)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(regexDateTime);
      });
  });

  it('deal links go to correct deal page/URL depending on dealType', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    // GEF link
    dashboardDeals.row.link(gefDealId).click();
    cy.url().should('eq', relative(`/gef/application-details/${gefDealId}`));

    // go back to the dashboard
    dashboardDeals.visit();

    // BSS link
    dashboardDeals.row.link(bssDealId).click();
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });

  // TODO: DTFS2-5372 - fix.
  it('should not show deals created by other banks', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    dashboardDeals
      .totalItems()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(`(${ALL_BANK1_DEALS.length} items)`);
      });

    cy.get('table tr').find(`[data-cy="deal__status--${ALL_BANK2_DEALS[0]._id}"]`).should('not.exist');
  });
});
