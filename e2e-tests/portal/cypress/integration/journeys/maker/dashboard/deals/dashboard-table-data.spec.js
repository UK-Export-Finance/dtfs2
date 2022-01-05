const { dashboard } = require('../../../../pages');
const relative = require('../../../../relativeURL');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View dashboard deals as a maker', () => {
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
    bank: { id: MAKER_LOGIN.bank.id },
    bankInternalRefName: 'Draft GEF',
    status: 'Draft',
    exporter: {
      companyName: 'mock company',
    },
  };

  beforeEach(() => {
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.deleteDeals(MAKER_LOGIN);

    cy.listAllUsers().then((usersInDb) => {
      const maker = usersInDb.find((user) => user.username === MAKER_LOGIN.username);
      BSS_DEAL.maker = maker;
      GEF_DEAL.maker = maker;
    });

    cy.insertOneDeal(BSS_DEAL, MAKER_LOGIN)
      .then((bssDeal) => {
        ALL_DEALS.push(bssDeal);
      });

    cy.insertOneGefApplication(GEF_DEAL, MAKER_LOGIN)
      .then((gefDeal) => {
        ALL_DEALS.push(gefDeal);
      });
  });

  it('BSS and GEF deals appears on the dashboard. Each deal goes to correct deal URL', () => {
    cy.login(MAKER_LOGIN);
    dashboard.visit();

    const gefDeal = ALL_DEALS.find(({ dealType, status }) =>
      dealType === 'GEF');

    const bssDeal = ALL_DEALS.find(({ dealType, status }) =>
      dealType === 'BSS/EWCS');

    const {
      exporter,
      bankRef,
      product,
      status,
      type,
      updated,
      link,
    } = dashboard.row;

    //---------------------------------------------------------------
    // should only see 2 deals
    //---------------------------------------------------------------
    dashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(2 items)');
    });


    //---------------------------------------------------------------
    // first deal should be the most recent (with our test data - GEF)
    //---------------------------------------------------------------
    const firstRow = cy.get('table tr').eq(1);
    const gefDealId = gefDeal._id;

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
    // link should take you to GEF deal page
    //---------------------------------------------------------------
    link(gefDealId).click();
    cy.url().should('eq', relative(`/gef/application-details/${gefDealId}`));


    //---------------------------------------------------------------
    // go back to the dashboard
    //---------------------------------------------------------------
    dashboard.visit();


    //---------------------------------------------------------------
    // second deal (BSS)
    //---------------------------------------------------------------
    const secondRow = cy.get('table tr').eq(2);
    const bssDealId = bssDeal._id;

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

    //---------------------------------------------------------------
    // link should take you to BSS deal page
    //---------------------------------------------------------------
    link(bssDealId).click();
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });

  // it('should tick the checkbox and refresh the page', () => {
  //   // login and go to dashboard
  //   cy.login(MAKER_LOGIN);
  //   dashboard.visit();

  //   const id = deal._id;
  //   cy.get('[data-cy="created-by-you"]').check();

  //   const { bankRef } = dashboard.row;

  //   bankRef(id).invoke('text').then((text) => {
  //     expect(text.trim()).equal('Tibetan submarine acquisition scheme');
  //   });
  // });
});
