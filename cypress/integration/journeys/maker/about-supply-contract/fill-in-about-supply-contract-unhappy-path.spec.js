const { contract, contractAboutSupplier, contractAboutPreview } = require('../../../pages');

const maker1 = { username: 'MAKER', password: 'MAKER' };

// test data we want to set up + work with..
const twentyOneDeals = require('../dashboard/twentyOneDeals');


context('about-supply-contract', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    const aDealWith_AboutSupplyContract_InStatus = (status) => {
      const candidates = twentyOneDeals
        .filter((deal) => (deal.submissionDetails && status === deal.submissionDetails.status))
        .filter((deal) => (deal.details && deal.details.status === 'Draft'));

      const deal = candidates[0];
      if (!deal) {
        throw new Error('no suitable test data found');
      } else {
        return deal;
      }
    };

    cy.deleteDeals(maker1);
    cy.insertOneDeal(aDealWith_AboutSupplyContract_InStatus('Not Started'), { ...maker1 })
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, selecting every option that requires more data.', () => {
    cy.login({ ...maker1 });

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);
    // check the status is displaying correctly
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Not Started');
    });
    contract.aboutSupplierDetailsLink().click();

    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierName().clear().type('UKFS');
    contractAboutSupplier.supplierAddress().country().select('GBR');
    contractAboutSupplier.supplierAddress().line1().type('1 Horseguards Road');
    contractAboutSupplier.supplierAddress().line3().type('Westminster');
    contractAboutSupplier.supplierAddress().town().type('London');
    contractAboutSupplier.supplierAddress().postcode().type('SW1A 2HQ');

    //-----
    // select a different correspondence address so we are forced to fill it in
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    // check default state
    contractAboutSupplier.supplierCorrespondenceAddress().country().should('have.value', 'GBR');
    // fill in form..
    contractAboutSupplier.supplierCorrespondenceAddress().line1().type('2 Horseguards Road');
    contractAboutSupplier.supplierCorrespondenceAddress().line3().type('Eastminster');
    contractAboutSupplier.supplierCorrespondenceAddress().town().type('Edinburgh');
    contractAboutSupplier.supplierCorrespondenceAddress().postcode().type('ED1 23S');
    contractAboutSupplier.industrySector().select('1009'); //Information and communication
    contractAboutSupplier.industryClass().select('62012'); //Business and domestic software development
    contractAboutSupplier.smeTypeSmall().click();
    contractAboutSupplier.supplyContractDescription().type('Description.');

    //-----
    // select a legally-distinct indemnifier
    contractAboutSupplier.legallyDistinct().click();
    // check default state
    contractAboutSupplier.indemnifierAddress().country().should('have.value', 'GBR');

    //-----
    // use the companies house search to find the indemnifier
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().type('08547313');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    //------
    // the search should populate the indemnifier address fields
    //
    contractAboutSupplier.indemnifierName().should('not.have.value', ''); // TODO if we had 'proper' test company we might assert real data
    contractAboutSupplier.indemnifierAddress().line1().should('not.have.value', ''); // TODO
    contractAboutSupplier.indemnifierAddress().line2().should('not.have.value', ''); // TODO
    contractAboutSupplier.indemnifierAddress().town().should('not.have.value', ''); // TODO
    contractAboutSupplier.indemnifierAddress().postcode().should('not.have.value', ''); // TODO
    contractAboutSupplier.indemnifierAddress().country().should('not.have.value', ''); // TODO

    //-----
    // continue filling in the form..
    // confirm that the indemnifier correspondence address is hidden until we click the radio-button...
    contractAboutSupplier.indemnifierCorrespondenceAddress().line1().should('not.be.visible');
    // select a different correspondence address for the indemnifier..
    contractAboutSupplier.indemnifierCorrespondenceAddressDifferent().click();
    // check default state
    contractAboutSupplier.indemnifierCorrespondenceAddress().country().should('have.value', 'GBR');
    // fill in form
    contractAboutSupplier.indemnifierCorrespondenceAddress().line1().type('27 Petersfield');
    contractAboutSupplier.indemnifierCorrespondenceAddress().line3().type('Broomfield');
    contractAboutSupplier.indemnifierCorrespondenceAddress().town().type('Chelmsford');
    contractAboutSupplier.indemnifierCorrespondenceAddress().postcode().type('CM1 4EP');


    contractAboutSupplier.saveAndGoBack().click();

    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });


    //---
    // confirm all the data we entered ^^ on the preview page
    //---
    contractAboutPreview.visit(deal);

    contractAboutPreview.supplierType().invoke('text').then((text) => {
      expect(text.trim()).equal('Exporter');
    });
    contractAboutPreview.supplierName().invoke('text').then((text) => {
      expect(text.trim()).equal('UKFS');
    });
    contractAboutPreview.supplierAddress().country().invoke('text').then((text) => {
      expect(text.trim()).equal('GBR');
    });
    contractAboutPreview.supplierAddress().line1().invoke('text').then((text) => {
      expect(text.trim()).equal('1 Horseguards Road');
    });
    contractAboutPreview.supplierAddress().line3().invoke('text').then((text) => {
      expect(text.trim()).equal('Westminster');
    });
    contractAboutPreview.supplierAddress().town().invoke('text').then((text) => {
      expect(text.trim()).equal('London');
    });
    contractAboutPreview.supplierAddress().postcode().invoke('text').then((text) => {
      expect(text.trim()).equal('SW1A 2HQ');
    });

    contractAboutPreview.supplierCorrespondenceAddressDifferent().invoke('text').then((text) => {
      expect(text.trim()).equal('Yes');
    });

    contractAboutPreview.supplierCorrespondenceAddress().line1().invoke('text').then((text) => {
      expect(text.trim()).equal('2 Horseguards Road');
    });
    contractAboutPreview.supplierCorrespondenceAddress().line3().invoke('text').then((text) => {
      expect(text.trim()).equal('Eastminster');
    });
    contractAboutPreview.supplierCorrespondenceAddress().town().invoke('text').then((text) => {
      expect(text.trim()).equal('Edinburgh');
    });
    contractAboutPreview.supplierCorrespondenceAddress().postcode().invoke('text').then((text) => {
      expect(text.trim()).equal('ED1 23S');
    });

    contractAboutPreview.industrySector().invoke('text').then((text) => {
      expect(text.trim()).equal('1009');// Information and communication
    });
    contractAboutPreview.industryClass().invoke('text').then((text) => {
      expect(text.trim()).equal('62012');// Business and domestic software development
    });
    contractAboutPreview.smeType().invoke('text').then((text) => {
      expect(text.trim()).equal('Small');
    });
    contractAboutPreview.supplyContractDescription().invoke('text').then((text) => {
      expect(text.trim()).equal('Description.');
    });

    contractAboutPreview.legallyDistinct().invoke('text').then((text) => {
      expect(text.trim()).equal('Yes');
    });

    contractAboutPreview.indemnifierCompaniesHouseRegistrationNumber().invoke('text').then((text) => {
      expect(text.trim()).equal('08547313');
    });

    contractAboutPreview.indemnifierName().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');// TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.indemnifierAddress().line1().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');// TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.indemnifierAddress().line2().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');// TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.indemnifierAddress().town().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');// TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.indemnifierAddress().postcode().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');// TODO if we had 'proper' test company we might assert real data
    });
    contractAboutPreview.indemnifierAddress().country().invoke('text').then((text) => {
      expect(text.trim()).not.equal('');// TODO if we had 'proper' test company we might assert real data
    });

    contractAboutPreview.indemnifierCorrespondenceAddressDifferent().invoke('text').then((text) => {
      expect(text.trim()).equal('Yes');
    });
    contractAboutPreview.indemnifierCorrespondenceAddress().country().invoke('text').then((text) => {
      expect(text.trim()).equal('GBR');
    });
    contractAboutPreview.indemnifierCorrespondenceAddress().line1().invoke('text').then((text) => {
      expect(text.trim()).equal('27 Petersfield');
    });
    contractAboutPreview.indemnifierCorrespondenceAddress().line3().invoke('text').then((text) => {
      expect(text.trim()).equal('Broomfield');
    });
    contractAboutPreview.indemnifierCorrespondenceAddress().town().invoke('text').then((text) => {
      expect(text.trim()).equal('Chelmsford');
    });
    contractAboutPreview.indemnifierCorrespondenceAddress().postcode().invoke('text').then((text) => {
      expect(text.trim()).equal('CM1 4EP');
    });
  });
});
