const { header, searchUsersActivity } = require('../../../pages');
const { ADMIN } = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');

context('Admin user searches for users', () => {
  beforeEach(() => {
    // login and visit search users page
    cy.login(ADMIN);
    header.activity().click();
  });

  it('Displays an error if the user does not enter a search term', () => {
    cy.url().should('eq', relative('/admin/activity/search'));

    // submit empty search bar
    searchUsersActivity.findUsersButton().click();

    // should be on same page
    cy.url().should('eq', relative('/admin/activity/search'));
    searchUsersActivity.errorSummary().should('exist');
    searchUsersActivity.searchTermError().should(
      'contain',
      'Enter the name or email address of the user you wish to be featured in the report',
    );
  });

  it('Displays an error if the user enters a search term less than 3 characters', () => {
    searchUsersActivity.searchBar().type('ab');
    searchUsersActivity.findUsersButton().click();

    // should be on same page
    cy.url().should('eq', relative('/admin/activity/search'));
    searchUsersActivity.errorSummary().should('exist');
    searchUsersActivity.searchTermError().should(
      'contain',
      'The name or email address of the user must contain at least 3 characters',
    );
  });

  it('Displays the select user page if the search term was longer than 3 characters', () => {
    searchUsersActivity.searchBar().type('ab/');

    searchUsersActivity.findUsersButton().click();

    // should be on select user page
    cy.url().should('eq', relative('/admin/activity/search-results?q=ab%2F'));
  });
});
