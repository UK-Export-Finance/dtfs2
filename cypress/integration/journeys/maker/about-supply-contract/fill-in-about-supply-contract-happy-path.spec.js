const {contract, contractAboutSupplier, contractAboutPreview} = require('../../../pages');
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
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

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
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.industrySector().select('1009'); //Information and communication
    contractAboutSupplier.industryClass().select('62012'); //Business and domestic software development
    contractAboutSupplier.smeTypeMicro().click();
    contractAboutSupplier.supplyContractDescription().type('Typing in tests takes time.')
    contractAboutSupplier.notLegallyDistinct().click();

    contractAboutSupplier.saveAndGoBack().click();

    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });


    // prove everything persisted by finding it on the preview page..
    contractAboutPreview.visit(deal);

    contractAboutPreview.supplierType().invoke('text').then((text) => {
      expect(text.trim()).equal('Exporter');
    });
    contractAboutPreview.supplierCompaniesHouseRegistrationNumber().invoke('text').then((text) => {
      expect(text.trim()).equal('08547313');
    });
    // // the search should populate the supplier address fields
    // contractAboutPreview.supplierAddressCountry().should('?', '?'); //TODO country; mapping company house "england"-> portal "United Kingdom"
    // contractAboutPreview.supplierAddress().county().should('not.have.value', ''); //TODO don't believe CH store county...
    contractAboutPreview.supplierName().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');//TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.supplierAddress().line1().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');//TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.supplierAddress().line2().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');//TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.supplierAddress().town().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');//TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.supplierAddress().postcode().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');//TODO if we had 'proper' test company we might assert real data
    });

    contractAboutPreview.suppliersCorrespondenceAddressDifferent().invoke('text').then((text) => {
      expect(text.trim()).equal('No');
    });
    contractAboutPreview.industrySector().invoke('text').then((text) => {
      expect(text.trim()).equal('1009');
    });
    contractAboutPreview.industryClass().invoke('text').then((text) => {
      expect(text.trim()).equal('62012');
    });
    contractAboutPreview.smeType().invoke('text').then((text) => {
      expect(text.trim()).equal('Micro');
    });
    contractAboutPreview.supplyContractDescription().invoke('text').then((text) => {
      expect(text.trim()).equal('Typing in tests takes time.');
    });
    contractAboutPreview.legallyDistinct().invoke('text').then((text) => {
      expect(text.trim()).equal('No');
    });

  });

});
