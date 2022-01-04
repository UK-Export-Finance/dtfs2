/* eslint-disable no-undef */
const { dashboard } = require('../../../pages');
const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.length === 1));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker')));

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View a deal with checker role', () => {
  let checkerDeal;

  const checkerDealData = {
    dealType: 'BSS/EWCS',
    submissionType: 'Manual Inclusion Notice',
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Tibettan submarine acquisition scheme',
    status: "Ready for Checker's approval",
    previousStatus: 'Draft',
  };
  const draftDealData = {
    dealType: 'BSS/EWCS',
    bankInternalRefName: 'abc-2-def',
    additionalRefName: 'Tibettan submarine acquisition scheme',
  };

  before(() => {
    cy.deleteGefApplications(MAKER_LOGIN);

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(checkerDealData, MAKER_LOGIN)
      .then((insertedDeal) => { checkerDeal = insertedDeal; });

    cy.insertOneDeal(draftDealData, MAKER_LOGIN);
  });

  it('Only a BSS deal with checker status appears on the dashboard', () => {
    // login and go to dashboard
    cy.login(CHECKER_LOGIN);
    dashboard.visit();

    const id = checkerDeal._id;

    const {
      bankRef, product, status, updated, link,
    } = dashboard.row;

    // dashboard.totalItems().invoke('text').then((text) => {
    //   expect(text.trim()).equal('(1 items)');
    // });

    bankRef(id).invoke('text').then((text) => {
      expect(text.trim()).equal('Tibettan submarine acquisition scheme');
    });

    product(id).invoke('text').then((text) => {
      expect(text.trim()).equal('BSS/EWCS');
    });

    status(id).invoke('text').then((text) => {
      expect(text.trim()).equal("Ready for Checker's approval");
    });

    updated(id).invoke('text').then((text) => {
      expect(text.trim()).to.match(regexDateTime);
    });

    link(id).click();

    cy.url().should('eq', relative(`/contract/${id}`));
  });
});
