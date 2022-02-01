const { dashboardDeals } = require('../../../pages');
const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker')));

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View dashboard deals as a checker', () => {
  const ALL_DEALS = [];

  const BSS_DEALS = {
    DRAFT: {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      bankInternalRefName: 'Draft BSS',
      status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
      additionalRefName: 'Tibettan submarine acquisition scheme',
    },
    READY_FOR_CHECK: {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
      bankInternalRefName: 'Ready BSS',
      additionalRefName: 'Tibettan submarine acquisition scheme',
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
      bank: { id: MAKER_LOGIN.bank.id },
      bankInternalRefName: 'Draft GEF',
      status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
    },
    READY_FOR_CHECK: {
      dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
      bank: { id: MAKER_LOGIN.bank.id },
      bankInternalRefName: 'Ready GEF',
      status: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
      exporter: {
        companyName: 'mock company',
      },
    },
  };

  before(() => {
    cy.deleteGefApplications(MAKER_LOGIN);

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(BSS_DEALS.READY_FOR_CHECK, MAKER_LOGIN)
      .then((bssDeal) => {
        ALL_DEALS.push(bssDeal);
      });

    cy.insertOneDeal(BSS_DEALS.DRAFT, MAKER_LOGIN);

    cy.insertOneGefApplication(GEF_DEALS.READY_FOR_CHECK, MAKER_LOGIN)
      .then((gefDeal) => {
        cy.setGefApplicationStatus(gefDeal._id, GEF_DEALS.READY_FOR_CHECK.status, MAKER_LOGIN)
          .then((updatedGefDeal) => {
            ALL_DEALS.push(updatedGefDeal.body);
          });
      });
  });

  it('Only deals with checker status appear on the dashboard. Each deal goes to correct deal URL', () => {
    // login, go to dashboard
    cy.login(CHECKER_LOGIN);
    dashboardDeals.visit();

    const gefDeal = ALL_DEALS.find(({ dealType, status }) =>
      dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
      && status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);

    const bssDeal = ALL_DEALS.find(({ dealType, status }) =>
      dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS
      && status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);

    const {
      exporter,
      bankRef,
      product,
      status,
      type,
      updated,
      link,
    } = dashboardDeals.row;

    // should only see 2 deals
    dashboardDeals.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });

    //---------------------------------------------------------------
    // first deal should be the most recently updated (with our test data - GEF)
    //---------------------------------------------------------------
    cy.get('table tr').eq(1).as('firstRow');
    const gefDealId = gefDeal._id;

    cy.get('table tr').eq(1).find(`[data-cy="deal__status--${gefDeal._id}"]`).should('exist');

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

    // link should take you to GEF deal page
    link(gefDealId).click();
    cy.url().should('eq', relative(`/gef/application-details/${gefDealId}`));

    // go back to the dashboard
    dashboardDeals.visit();

    // second deal (BSS)
    cy.get('table tr').eq(2).as('secondRow');
    const bssDealId = bssDeal._id;

    cy.get('@secondRow').find(`[data-cy="deal__status--${bssDealId}"]`).should('exist');

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

    // link should take you to BSS deal page
    link(bssDealId).click();
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });
});
