const { contract, contractConfirmSubmission } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const CHECKER_LOGIN = mockUsers.find( user=> (user.roles.includes('checker') && user.bank.name === 'Barclays Bank') );
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );

// test data we want to set up + work with..
const dealReadyToSubmit = require('./test-data/dealReadyToSubmit');


context('A checker submits a deal; workflow responds with a typeB->in progress, then another typeB->accepted', () => {
  let goodDeal, badDeal;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.insertManyDeals([dealReadyToSubmit()], MAKER_LOGIN)
      .then(insertedDeals => {
        goodDeal=insertedDeals[0];
      });
  });

  it('Checker submits a deal; workflow responds with 2 typeBs; the deal ends up in state=accepted without conditions.', () => {
    // log in, visit a deal, submit it.
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    // trigger the typeB message that should put us -> 'in progress with ukef'
    cy.sendTypeB({
      header: {
        portal_deal_id: goodDeal._id,
        bank_deal_id: goodDeal.details.bankSupplyContractID,
        Message_Type: "B",
        Action_Code: "004"
      },
      deal: {
        UKEF_deal_id: "123456",
        Deal_status: "submission_acknowledged",
        Deal_comments: "blah blah"
      },
      bonds: [
        {
          BSS_portal_facility_id: goodDeal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: "54321",
          BSS_status: "Issued acknowledged",
          BSS_comments: "blahblah blah blahblah"
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: goodDeal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: "65432",
          EWCS_status: "Issued acknowledged",
          EWCS_comments: "blahblah blah blahblah"
        }

      ]
    })

    // trigger the typeB message that should put us -> 'accepted'
    //------
    // NOTE [dw]
    // I don't know what i should be sending around re: bonds+loans here
    //  but at time of writing: if i don't pass some bonds+loans in a typeB
    //  we fail to parse the typeB.. so i'm putting in what appears to be enough
    //  to make things process...
    //------
    cy.sendTypeB({
      header: {
        portal_deal_id: goodDeal._id,
        bank_deal_id: goodDeal.details.bankSupplyContractID,
        Message_Type: "B",
        Action_Code: "006"
      },
      deal: {
        UKEF_deal_id: "123456",
        Deal_status: "approved",
        Deal_comments: "blah blah"
      },
      bonds: [
        {
          BSS_portal_facility_id: goodDeal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: "54321",
          BSS_status: "Issued acknowledged",
          BSS_comments: "blahblah blah blahblah"
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: goodDeal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: "65432",
          EWCS_status: "Issued acknowledged",
          EWCS_comments: "blahblah blah blahblah"
        }

      ]
    })

    // check the status update
    contract.visit(goodDeal);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal("Accepted by UKEF (without conditions)");
    });
    contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal("In progress by UKEF");
    });

  });

});
