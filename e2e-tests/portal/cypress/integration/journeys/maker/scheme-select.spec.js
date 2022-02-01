const pages = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');

const mockUsers = require('../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

context('Select a scheme', () => {
  beforeEach(() => {
    cy.login(MAKER_LOGIN);
    pages.dashboard.createNewSubmission().click();
  });

  it('should display validation error if submitted without confirming a scheme', () => {
    pages.selectScheme.continue().click();

    cy.url().should('eq', relative('/select-scheme'));
    cy.title().should('eq', `What scheme do you want to apply for?${pages.defaults.pageTitleAppend}`);

    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    pages.selectScheme.schemeError('Select which scheme you want to apply for');
  });

  it('the Cancel option links back to the home page', () => {
    pages.selectScheme.cancel().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('should start BSS/EWC journey if option selected', () => {
    pages.selectScheme.bss().click();
    pages.selectScheme.continue().click();

    cy.url().should('eq', relative('/before-you-start'));
  });

  it('should start BSS/EWC journey if option selected', () => {
    pages.selectScheme.gef().click();
    pages.selectScheme.continue().click();

    cy.url().should('eq', relative('/gef/mandatory-criteria'));
  });
});
