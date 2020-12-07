// const moment = require('moment');
// const relative = require('../../relativeURL');
const pages = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');
const {
  fillAndSubmitIssueBondFacilityForm,
} = require('../maker/submit-issued-facilities-for-review/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityForm,
} = require('../maker/submit-issued-facilities-for-review/fillAndSubmitIssueLoanFacilityForm');


const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const miaDealReadyToSubmit = require('./miaDeal-with-unissued-facilities');


context('trying to replicate....', () => {
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

  it('todo......', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready');
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
        Deal_status: 'submission_acknowledged',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
        },
        {
          BSS_portal_facility_id: deal.bondTransactions.items[1]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[1]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
      ],
    });


    //---------------------------------------------------------------
    // receive typeB XML with `Approved` deal status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '006',
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
          BSS_status: '""',
          BSS_comments: 'blahblah blah blahblah',
        },
        {
          BSS_portal_facility_id: deal.bondTransactions.items[1]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: '""',
          EWCS_comments: 'blahblah blah blahblah',
        },
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[1]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: '""',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });


    // STEP 5
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    // complete one bond issue facility form

    const firstBondId = deal.bondTransactions.items[0]._id;
    const firstBondRow = pages.contract.bondTransactionsTable.row(firstBondId);

    firstBondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();

    // complete one loan issue facility form

    const firstLoanId = deal.loanTransactions.items[0]._id;
    const firstLoanRow = pages.contract.loansTransactionsTable.row(firstLoanId);

    firstLoanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityForm();

    // start but don't complete, second bond

    const secondBondId = deal.bondTransactions.items[1]._id;
    const secondBondRow = pages.contract.bondTransactionsTable.row(secondBondId);

    secondBondRow.issueFacilityLink().click();

    pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');
    pages.bondIssueFacility.submit().click();
    pages.bondIssueFacility.cancelButton().click();

    // start but don't complete, second loan
    const secondLoanId = deal.loanTransactions.items[1]._id;
    const secondLoanRow = pages.contract.loansTransactionsTable.row(secondLoanId);

    secondLoanRow.issueFacilityLink().click();
    pages.loanIssueFacility.disbursementAmount().type('1234');
    pages.loanIssueFacility.bankReferenceNumber().type('5678');

    pages.loanIssueFacility.submit().click();
    pages.loanIssueFacility.cancelButton().click();


    // now at step 6 in the ticket....


    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready');
    pages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();


    // now at step 7 of the ticket....

    // step 8 N/A for e2e, step 8 is the type A xml we send.


    //---------------------------------------------------------------
    // receive typeB XML with `Acknowledged` deal status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: dealId,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '011',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'confirmation_acknowledged',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
        },
        {
          BSS_portal_facility_id: deal.bondTransactions.items[1]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[1]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
      ],
    });

    // now at step 9 of the ticket...


    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    // so HERE the only remaining unissued Bond has 'not started' status...
    // it gets wiped somehow after this.


    // step 10...
    // issue the remaining incomplete/not started, unissued facilities.

    secondBondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();

    secondLoanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityForm();

    // this is what we should get to correctly replicate the bug:
    secondBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('Not started');
      expect(text.trim()).to.equal('Completed');
    });

    secondLoanRow.loanStatus().invoke('text').then((text) => {
      // expect(text.trim()).to.equal('Incomplete');
      expect(text.trim()).not.to.equal('Not started');
      expect(text.trim()).to.equal('Completed');
    });
  });
});
