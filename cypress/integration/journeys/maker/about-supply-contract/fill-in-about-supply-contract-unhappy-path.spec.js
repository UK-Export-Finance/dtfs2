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

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, selecting every option that requires more data.', () => {
    cy.login({...maker1});

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);
    // check the status is displaying correctly
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Not Started');
    });
    contract.aboutSupplierDetailsLink().click();


    contractAboutSupplier.supplierType().select('Exporter');

    //-----
    // manually fill out the form since we've tried the search in the happy-path test
    contractAboutSupplier.supplierName().type('UKFS');
    contractAboutSupplier.supplierAddress().country().select('GBR');
    contractAboutSupplier.supplierAddress().line1().type('1 Horseguards Road');
    contractAboutSupplier.supplierAddress().town().type('Westminster');
    contractAboutSupplier.supplierAddress().county().type('London');
    contractAboutSupplier.supplierAddress().postcode().type('SW1A 2HQ');

    //-----
    // select a different correspondence address so we are forced to fill it in
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    contractAboutSupplier.supplierCorrespondenceAddress().country().select('GBR');
    contractAboutSupplier.supplierCorrespondenceAddress().line1().type('2 Horseguards Road');
    contractAboutSupplier.supplierCorrespondenceAddress().town().type('Eastminster');
    contractAboutSupplier.supplierCorrespondenceAddress().county().type('Edinburgh');
    contractAboutSupplier.supplierCorrespondenceAddress().postcode().type('ED1 23S');

    contractAboutSupplier.industrySector().select('1009'); //Information and communication
    contractAboutSupplier.industryClass().select('62012'); //Business and domestic software development
    contractAboutSupplier.smeTypeSmall().click();
    contractAboutSupplier.supplyContractDescription().type('Description.')

    //-----
    // select a legally-distinct indemnifier
    contractAboutSupplier.legallyDistinct().click();

    //-----
    // use the companies house search to find the indemnifier
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().type('08547313');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    // all the fields we had already filled in should still be present..
    contractAboutSupplier.supplierType().should('have.value', 'Exporter');
    contractAboutSupplier.supplierName().should('have.value', 'UKFS');
    contractAboutSupplier.supplierAddress().country().should('have.value', 'GBR');
    contractAboutSupplier.supplierAddress().line1().should('have.value', '1 Horseguards Road');
    contractAboutSupplier.supplierAddress().town().should('have.value', 'Westminster');
    contractAboutSupplier.supplierAddress().county().should('have.value', 'London');
    contractAboutSupplier.supplierAddress().postcode().should('have.value', 'SW1A 2HQ');
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().should('be.checked');
    //contractAboutSupplier.supplierCorrespondenceAddress().country().should('have.value','GBR'); //TODO - mapping of countries between companies-house+us
    contractAboutSupplier.supplierCorrespondenceAddress().line1().should('have.value','2 Horseguards Road');
    contractAboutSupplier.supplierCorrespondenceAddress().town().should('have.value','Eastminster');
    contractAboutSupplier.supplierCorrespondenceAddress().county().should('have.value','Edinburgh');
    contractAboutSupplier.supplierCorrespondenceAddress().postcode().should('have.value','ED1 23S');
    contractAboutSupplier.industrySector().should('have.value','1009'); //Information and communication
    contractAboutSupplier.industryClass().should('have.value','62012'); //Business and domestic software development
    contractAboutSupplier.smeTypeSmall().should('be.checked')
    contractAboutSupplier.supplyContractDescription().should('have.value','Description.')
    contractAboutSupplier.legallyDistinct().should('be.checked');
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().should('have.value', '08547313');

    //------
    // the search should populate the indemnifier address fields
    //
    // contractAboutSupplier.supplierAddressCountry().should('?', '?'); //TODO country; mapping company house "england"-> portal "United Kingdom"
    // contractAboutSupplier.supplierAddress().county().should('not.have.value', ''); //TODO don't believe CH store county...
    contractAboutSupplier.indemnifierName().should('not.have.value', ''); //TODO if we had 'proper' test company we might assert real data
    contractAboutSupplier.indemnifierAddress().line1().should('not.have.value', ''); //TODO
    contractAboutSupplier.indemnifierAddress().line2().should('not.have.value', ''); //TODO
    contractAboutSupplier.indemnifierAddress().town().should('not.have.value', ''); //TODO
    contractAboutSupplier.indemnifierAddress().postcode().should('not.have.value', ''); //TODO

    //-----
    // continue filling in the form..
    // select a different correspondence address for the indemnifier..
    contractAboutSupplier.indemnifierCorrespondenceAddressDifferent().click();
    contractAboutSupplier.indemnifierCorrespondenceAddress().country().select('GBR');
    contractAboutSupplier.indemnifierCorrespondenceAddress().line1().type('27 Petersfield');
    contractAboutSupplier.indemnifierCorrespondenceAddress().town().type('Chelmsford');
    contractAboutSupplier.indemnifierCorrespondenceAddress().county().type('Essex');
    contractAboutSupplier.indemnifierCorrespondenceAddress().postcode().type('CM1 4EP');


    contractAboutSupplier.saveAndGoBack().click();

    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });
    contract.aboutSupplierDetailsLink().click();
    //
    //
    // // the fields we already filled in should still be present
    // contractAboutSupplier.supplierType().should('have.value', 'Exporter');
    // contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().should('have.value', '08547313');
    // // // the search should populate the supplier address fields
    // // contractAboutSupplier.supplierAddressCountry().should('?', '?'); //TODO country; mapping company house "england"-> portal "United Kingdom"
    // // contractAboutSupplier.supplierAddress().county().should('not.have.value', ''); //TODO don't believe CH store county...
    // contractAboutSupplier.supplierName().should('not.have.value', ''); //TODO if we had 'proper' test company we might assert real data
    // contractAboutSupplier.supplierAddress().line1().should('not.have.value', ''); //TODO
    // contractAboutSupplier.supplierAddress().line2().should('not.have.value', ''); //TODO
    // contractAboutSupplier.supplierAddress().town().should('not.have.value', ''); //TODO
    // contractAboutSupplier.supplierAddress().postcode().should('not.have.value', ''); //TODO
    //
    // contractAboutSupplier.suppliersCorrespondenceAddressSame().should('be.checked');
    // contractAboutSupplier.industrySector().should('have.value', '1009'); //Information and communication
    // contractAboutSupplier.industryClass().should('have.value', '62012'); //Business and domestic software development
    // contractAboutSupplier.smeTypeMicro().should('be.checked');
    // contractAboutSupplier.supplyContractDescription().should('have.value', 'Typing in tests takes time.')
    // contractAboutSupplier.notLegallyDistinct().should('be.checked');

  });

});
