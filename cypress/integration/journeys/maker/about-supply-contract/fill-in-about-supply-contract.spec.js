const {contract, contractAboutSupplier} = require('../../../pages');
const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../dashboard/twentyOneDeals');


context('about-supply-contract', () => {
  let deal;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    const aDealWith_AboutSupplyContract_InStatus = (status) => {
      const candidates = twentyOneDeals
        .filter( deal=> (deal.submissionDetails && status === deal.submissionDetails.status) )
        .filter( deal=> (deal.details && deal.details.status === 'Draft'));

      const deal = candidates[0];
      if (!deal) {
        throw new Error("no suitable test data found");
      } else {
        return deal;
      }
    };

    cy.deleteDeals(maker1);
    cy.insertOneDeal(aDealWith_AboutSupplyContract_InStatus('Not Started'), { ...maker1 })
      .then( insertedDeal =>  deal=insertedDeal );
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, using the companies house search.', () => {
    cy.login({...maker1});

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);
    // check the status is displaying correctly
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Not Started');
    });
    contract.aboutSupplierDetailsLink().click();


    //---
    // use companies-house lookup
    //---
    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('08547313'); //TODO better test company?
    contractAboutSupplier.searchCompaniesHouse().click();

    // the fields we already filled in should still be present
    contractAboutSupplier.supplierType().should('have.value', 'Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().should('have.value', '08547313');

    // // the search should populate the supplier address fields
    // contractAboutSupplier.supplierAddressCountry().should('?', '?'); //TODO country; mapping company house "england"-> portal "United Kingdom"
    // contractAboutSupplier.supplierAddress().county().should('not.have.value', ''); //TODO don't believe CH store county...
    contractAboutSupplier.supplierName().should('not.have.value', ''); //TODO if we had 'proper' test company we might assert real data
    contractAboutSupplier.supplierAddress().line1().should('not.have.value', ''); //TODO
    contractAboutSupplier.supplierAddress().line2().should('not.have.value', ''); //TODO
    contractAboutSupplier.supplierAddress().town().should('not.have.value', ''); //TODO
    contractAboutSupplier.supplierAddress().postcode().should('not.have.value', ''); //TODO


    //---
    // fill in the simplest version of the form so we can submit it and save it..
    //---
    contractAboutSupplier.correspondenceAddressSame().click();
    contractAboutSupplier.industrySector().select('1009'); //Information and communication
    contractAboutSupplier.industryClass().select('62012'); //Business and domestic software development
    contractAboutSupplier.smeTypeMicro().click();
    contractAboutSupplier.supplyContractDescription().type('Typing in tests takes time.')
    contractAboutSupplier.notLegallyDistinct().click();

    contractAboutSupplier.saveAndGoBack().click();

    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });
    contract.aboutSupplierDetailsLink().click();


    // the fields we already filled in should still be present
    contractAboutSupplier.supplierType().should('have.value', 'Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().should('have.value', '08547313');
    // // the search should populate the supplier address fields
    // contractAboutSupplier.supplierAddressCountry().should('?', '?'); //TODO country; mapping company house "england"-> portal "United Kingdom"
    // contractAboutSupplier.supplierAddress().county().should('not.have.value', ''); //TODO don't believe CH store county...
    contractAboutSupplier.supplierName().should('not.have.value', ''); //TODO if we had 'proper' test company we might assert real data
    contractAboutSupplier.supplierAddress().line1().should('not.have.value', ''); //TODO
    contractAboutSupplier.supplierAddress().line2().should('not.have.value', ''); //TODO
    contractAboutSupplier.supplierAddress().town().should('not.have.value', ''); //TODO
    contractAboutSupplier.supplierAddress().postcode().should('not.have.value', ''); //TODO

    contractAboutSupplier.correspondenceAddressSame().should('be.checked');
    contractAboutSupplier.industrySector().should('have.value', '1009'); //Information and communication
    contractAboutSupplier.industryClass().should('have.value', '62012'); //Business and domestic software development
    contractAboutSupplier.smeTypeMicro().should('be.checked');
    contractAboutSupplier.supplyContractDescription().should('have.value', 'Typing in tests takes time.')
    contractAboutSupplier.notLegallyDistinct().should('be.checked');

  });

});
