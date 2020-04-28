const {contract, contractAboutSupplier} = require('../../../pages');
const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../dashboard/twentyOneDeals');


context('about-supply-contract', () => {

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    const aDealInStatus = (status) => {
      return twentyOneDeals.filter( deal=>status === deal.details.status)[0];
    };

    cy.deleteDeals(maker1);
    cy.insertOneDeal(aDealInStatus('Draft'), { ...maker1 });
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, using the companies house search.', () => {
    cy.login({...maker1});
    cy.aDealInStatus("Draft").then( (deal) => {
      // go the long way for the first test- actually clicking via the contract page to prove the link..
      contract.visit(deal);
      contract.aboutSupplierDetailsLink().click();

      contractAboutSupplier.supplierType().select('Exporter');
      contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('08547313'); //TODO better test company?
      contractAboutSupplier.searchCompaniesHouse().click();

      // the fields we already filled in should still be present
      contractAboutSupplier.supplierType().should('have.value', 'Exporter');
      contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().should('have.value', '08547313');

      // // the search should populate the supplier address fields
      //contractAboutSupplier.supplierAddressCountry().should('?', '?'); //TODO country; mapping company house "england"-> portal "United Kingdom"
      // contractAboutSupplier.supplierAddress().county().should('not.have.value', ''); //TODO don't believe CH store county...
      contractAboutSupplier.supplierName().should('not.have.value', ''); //TODO if we had 'proper' test company we might assert real data
      contractAboutSupplier.supplierAddress().line1().should('not.have.value', ''); //TODO
      contractAboutSupplier.supplierAddress().line2().should('not.have.value', ''); //TODO
      contractAboutSupplier.supplierAddress().town().should('not.have.value', ''); //TODO
      contractAboutSupplier.supplierAddress().postcode().should('not.have.value', ''); //TODO


    });

  });

});
