/* eslint-disable no-undef */
const { gefDashboard } = require('../../../pages');
const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.roles.length === 1));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker')));

const regexDateTime = /\d?\d \w\w\w \d\d\d\d/;

context('View a deal with checker role', () => {
  let checkerDeal;

  const checkerDealData = {
    bankId: MAKER_LOGIN.bank.id,
    bankInternalRefName: 'abc-123-def',
  };
  const draftDealData = {
    bankId: MAKER_LOGIN.bank.id,
    bankInternalRefName: 'abc-456-def',
  };

  before(() => {
    cy.deleteGefApplications(MAKER_LOGIN);
    cy.insertOneGefApplication(checkerDealData, MAKER_LOGIN)
      .then((insertedDeal) => {
        checkerDeal = insertedDeal;
        cy.setGefApplicationStatus(checkerDeal._id, 'BANK_CHECK', MAKER_LOGIN);
      });

    cy.insertOneGefApplication(draftDealData, MAKER_LOGIN);
  });

  it('Only a GEF deal with checker status appears on the dashboard', () => {
    // login and go to dashboard
    cy.login(CHECKER_LOGIN);
    gefDashboard.visit();

    const id = checkerDeal._id;

    const {
      bankRef, product, status, updated, link,
    } = gefDashboard.row;

    gefDashboard.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(1 items)');
    });

    bankRef(id).invoke('text').then((text) => {
      expect(text.trim()).equal('abc-123-def');
    });

    product(id).invoke('text').then((text) => {
      expect(text.trim()).equal('GEF');
    });

    status(id).invoke('text').then((text) => {
      expect(text.trim()).equal("Ready for Checker's approval");
    });

    updated(id).invoke('text').then((text) => {
      expect(text.trim()).to.match(regexDateTime);
    });

    link(id).click();

    cy.url().should('eq', relative(`/gef/application-details/${id}`));
  });
});
