const { login } = require('../../pages');
const relative = require('../../relativeURL');

context('Portal homepage', () => {
  it('Ensure user is on the login page', () => {
    login.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Ensure service text is visible on the portal login page', () => {
    login.service().contains("If you've not used this service before");
  });

  it('Ensure all bank names are visible on the portal login page', () => {
    login
      .banks()
      .contains(
        '<li>Barclays Bank</li><li>HSBC UK Bank</li><li>Lloyds Bank</li><li>Bank of Scotland</li><li>Westminster Bank</li><li>Royal Bank of Scotland</li><li>Ulster Bank</li><li>Santander UK plc.</li><li>Newable Bank</li><li>Emirates NBD Bank (P.J.S.C)</li><li>Virgin Money</li><li>Shawbrook Bank</li>',
      );
  });

  it('Ensure product text is visible on the portal login page', () => {
    login.products().contains('<li>Bond Support and Export Working Capital scheme</li><li>General Export Facility scheme</li>');
  });

  it('Ensure comply text is visible on the portal login page', () => {
    login.comply().contains("Your bank must comply with the terms of the MGA you're applying for.  The MGA is signed between your bank and UK Export Finance.");
  });
});
