const { login } = require('../../pages');
const relative = require('../../relativeURL');

context('Portal homepage', () => {
  beforeEach(() => {
    // Visit login page
    login.visit();
  });

  it('Ensure user is on the login page', () => {
    cy.url().should('eq', relative('/login'));
  });

  it('Ensure service text is visible on the portal login page', () => {
    login.service().contains("If you've not used this service before");
  });

  it('Ensure all bank names are visible on the portal login page', () => {
    login.banks().contains('Barclays Bank');
    login.banks().contains('HSBC UK Bank');
    login.banks().contains('Lloyds Bank');
    login.banks().contains('Bank of Scotland');
    login.banks().contains('Westminster Bank');
    login.banks().contains('Royal Bank of Scotland');
    login.banks().contains('Ulster Bank');
    login.banks().contains('Santander UK plc.');
    login.banks().contains('Newable Bank');
    login.banks().contains('Emirates NBD Bank (P.J.S.C)');
    login.banks().contains('Virgin Money');
    login.banks().contains('Shawbrook Bank');
    login.banks().contains('ICICI');
    login.banks().contains('ABC Bank');
    login.banks().contains('LDF Operations (trading as White Oak)');
    login.banks().contains('KBC Bank');
    login.banks().contains('Banco Santander');
    login.banks().contains('Nighthawk Partners');
  });

  it('Ensure product text is visible on the portal login page', () => {
    login.products().contains('Bond Support and Export Working Capital scheme');
    login.products().contains('General Export Facility scheme');
  });

  it('Ensure comply text is visible on the portal login page', () => {
    login.comply().contains("Your bank must comply with the terms of the MGA you're applying for. The MGA is signed between your bank and UK Export Finance.");
  });
});
