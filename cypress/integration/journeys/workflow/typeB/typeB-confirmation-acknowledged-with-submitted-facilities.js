const { contract, contractConfirmSubmission } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

// test data we want to set up + work with..
const dealReadyToSubmitWithAlreadySubmittedIssuedFacilities = require('./MIA-deal-ready-to-submit-with-already-submitted-issued-facilities');

context('A checker confirms a deal; workflow responds with a confirmation_acknowledged status', () => {
  let deal;

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
      });
  });

  it('Checker submits a deal; workflow responds; UKEF_deal_id is updated within portal.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(deal);
    contract.proceedToSubmit().click();

    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '011',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved_conditions',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      // loans: [
      //   {
      //     EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
      //     EWCS_ukef_facility_id: '65432',
      //     EWCS_status: '',
      //     EWCS_comments: 'blahblah blah blahblah',
      //   },
      // ],
    });

    contract.visit(deal);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });
  });
});
