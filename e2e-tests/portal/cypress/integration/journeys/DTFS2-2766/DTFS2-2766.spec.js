// const moment = require('moment');
// const relative = require('../../relativeURL');
const pages = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');
const { fillAndSubmitIssueBondFacilityForm } = require('../maker/submit-issued-facilities-for-review/fillAndSubmitIssueBondFacilityForm');


const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const miaDealReadyToSubmit = require('./miaDeal-with-unissued-facilities');


context('todoo...', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(miaDealReadyToSubmit, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('blaaaaaaa', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();


    //---------------------------------------------------------------
    // receive typeB XML with `In progress` deal status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: dealId,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '004',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'in_progress_by_ukef',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '"',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
      ],
    });


    //---------------------------------------------------------------
    // receive typeB XML with `Approved` deal status
    //---------------------------------------------------------------
    // cy.sendTypeB({
    //   header: {
    //     portal_deal_id: dealId,
    //     bank_deal_id: deal.details.bankSupplyContractID,
    //     Message_Type: 'B',
    //     Action_Code: '011',
    //   },
    //   deal: {
    //     UKEF_deal_id: '123456',
    //     Deal_status: 'approved',
    //     Deal_comments: 'blah blah',
    //   },
    //   bonds: [
    //     {
    //       BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
    //       BSS_ukef_facility_id: '54321',
    //       BSS_status: 'Issued acknowledged',
    //     },
    //   ],
    //   loans: [
    //     {
    //       EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
    //       EWCS_ukef_facility_id: '56789',
    //       EWCS_status: 'Issued acknowledged',
    //     },
    //   ],
    // });
    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '011',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          // BSS_status: '',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '65432',
          // EWCS_status: '',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });


    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    // (to replicate bug): facilities should be 'acknowledged' and 'incomplete'
    // fill in issue facility forms
    // bug is - are completeing form, some are marked as 'not started' but should be 'completed'

    const bondId = deal.bondTransactions.items[0]._id;
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();

    cy.url().should('eq', '/test');
  });
});
