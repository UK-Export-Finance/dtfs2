const pages = require('../../../pages');
const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const dealReadyToSubmitWithAlreadySubmittedIssuedFacilities = require('./test-data/MIA-deal-ready-to-submit-with-already-submitted-issued-facilities');

context('Checker submits a deal; workflow responds twice with the same confirmation_acknowledged status', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(dealReadyToSubmitWithAlreadySubmittedIssuedFacilities, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = dealReadyToSubmitWithAlreadySubmittedIssuedFacilities;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
  });

  it('deal status should not have duplicate `current` and `previous` statuses', () => {
    //---------------------------------------------------------------
    // Checker logs in, submits deal to UKEF
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    //---------------------------------------------------------------
    // Receive type B message with `approved` status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '017',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved_conditions',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [],
    });

    //---------------------------------------------------------------
    // Deal status should be updated
    //---------------------------------------------------------------
    pages.contract.visit(deal);
    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Accepted by UKEF (with conditions)');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    //---------------------------------------------------------------
    // Receive a second type B message with the same, `approved` status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '017',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved_conditions',
        Deal_comments: 'blah blah',
      },
      bonds: [],
      loans: [
        {
          EWCS_portal_facility_id: dealFacilities.loans[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: '',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });

    //---------------------------------------------------------------
    // Deal status should not be update, should remain the same
    // Deal status should not have duplicate statuses
    //---------------------------------------------------------------
    pages.contract.visit(deal);
    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Accepted by UKEF (with conditions)');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.not.equal('Accepted by UKEF (with conditions)');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });
  });
});
