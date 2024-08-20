const { dashboardDeals } = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../fixtures/constants');

const { ADMIN, BANK1_MAKER1, BANK1_CHECKER1, BANK2_MAKER2 } = MOCK_USERS;

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View dashboard deals as a checker', () => {
  const BANK1_DEALS = [];

  const BSS_DEALS = {
    DRAFT: {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      bankInternalRefName: 'Draft BSS',
      status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
      additionalRefName: 'Additional reference name example',
    },
    READY_FOR_CHECK: {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
      bankInternalRefName: 'Ready BSS',
      additionalRefName: 'Additional reference name example',
      status: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
      previousStatus: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
      exporter: {
        companyName: 'mock company',
      },
    },
  };

  const GEF_DEALS = {
    DRAFT: {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
      bank: { id: BANK1_MAKER1.bank.id },
      bankInternalRefName: 'Draft GEF',
      status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
    },
    READY_FOR_CHECK: {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
      bank: { id: BANK1_MAKER1.bank.id },
      bankInternalRefName: 'Ready GEF',
      status: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
      exporter: {
        companyName: 'mock company',
      },
    },
  };

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEALS.READY_FOR_CHECK, BANK1_MAKER1).then((createdDeal) => {
      BANK1_DEALS.push(createdDeal);
    });

    cy.insertOneDeal(BSS_DEALS.DRAFT, BANK1_MAKER1).then((createdDeal) => {
      BANK1_DEALS.push(createdDeal);
    });

    cy.insertOneGefApplication(GEF_DEALS.READY_FOR_CHECK, BANK1_MAKER1).then((gefDeal) => {
      cy.setGefApplicationStatus(gefDeal._id, GEF_DEALS.READY_FOR_CHECK.status, BANK1_MAKER1).then((updatedGefDeal) => {
        BANK1_DEALS.push(updatedGefDeal.body);
      });
    });

    cy.insertOneDeal(BSS_DEALS.READY_FOR_CHECK, BANK2_MAKER2);
  });

  it("Only deals with checker status that belong to the checker's bank appear on the dashboard. Each deal goes to correct deal URL", () => {
    // login, go to dashboard
    cy.login(BANK1_CHECKER1);
    dashboardDeals.visit();

    const gefDeal = BANK1_DEALS.find(
      ({ dealType, status }) => dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF && status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
    );

    const bssDeal = BANK1_DEALS.find(
      ({ dealType, status }) => dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS && status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
    );

    const { exporter, bankRef, product, status, type, updated, link } = dashboardDeals.row;

    // should only see 2 deals - ready for check and in Bank 1
    const EXPECTED_DEALS = BANK1_DEALS.filter((deal) => deal.status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);

    cy.assertText(dashboardDeals.totalItems(), `(${EXPECTED_DEALS.length} items)`);

    //---------------------------------------------------------------
    // first deal should be the most recently updated (with our test data - GEF)
    //---------------------------------------------------------------
    cy.get('table tr').eq(1).as('firstRow');
    const gefDealId = gefDeal._id;

    cy.get('table tr').eq(1).find(`[data-cy="deal__status--${gefDeal._id}"]`).should('exist');

    cy.assertText(exporter(gefDealId), gefDeal.exporter.companyName);

    cy.assertText(bankRef(gefDealId), gefDeal.bankInternalRefName);

    cy.assertText(product(gefDealId), gefDeal.dealType);

    cy.assertText(type(gefDealId), '-');

    cy.assertText(status(gefDealId), gefDeal.status);

    cy.assertText(updated(gefDealId), regexDateTime);

    // link should take you to GEF deal page
    link(gefDealId).click();
    cy.url().should('eq', relative(`/gef/application-details/${gefDealId}`));

    // go back to the dashboard
    dashboardDeals.visit();

    // second deal (BSS)
    cy.get('table tr').eq(2).as('secondRow');
    const bssDealId = bssDeal._id;

    cy.get('@secondRow').find(`[data-cy="deal__status--${bssDealId}"]`).should('exist');

    cy.assertText(exporter(bssDealId), bssDeal.exporter.companyName);

    cy.assertText(bankRef(bssDealId), bssDeal.bankInternalRefName);

    cy.assertText(product(bssDealId), bssDeal.dealType);

    cy.assertText(type(bssDealId), bssDeal.submissionType);

    cy.assertText(status(bssDealId), bssDeal.status);

    cy.assertText(updated(bssDealId), regexDateTime);

    // link should take you to BSS deal page
    link(bssDealId).click();
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });
});
