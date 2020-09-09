const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithUnIssuedFacilities = require('./dealWithUnIssuedFacilities');
const mockUsers = require('../../../../fixtures/mockUsers');
const {
  fillAndSubmitIssueBondFacilityForm,
} = require('../../maker/submit-issued-facilities-for-review/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityForm,
} = require('../../maker/submit-issued-facilities-for-review/fillAndSubmitIssueLoanFacilityForm');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));

context('A maker submits a deal to checker, checker submits to UKEF, maker submits issued loan/bond facilities, checker returns to maker, maker submits to checker', () => {
  let deal;
  let dealId;

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
  });

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.insertOneDeal(dealWithUnIssuedFacilities, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Checker can view (but not edit) Issued facilities, facility statuses should be updated throughout the deal status changes', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    //---------------------------------------------------------------
    // receive typeB XML with `Approved` deal status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: dealId,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '016',
      },
      deal: {
        UKEF_deal_id: dealId,
        Deal_status: 'approved',
      },
      bonds: [
        {
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
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
    // maker adds Issued Facilities and submits deal for review by checker
    // facility status/links should be updated/hidden
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    pages.contract.visit(deal);

    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    bondRow.deleteLink().should('not.exist');

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    loanRow.deleteLink().should('not.exist');

    bondRow.issueFacilityLink().click();
    fillAndSubmitIssueBondFacilityForm();

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    loanRow.issueFacilityLink().click();
    fillAndSubmitIssueLoanFacilityForm();

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker can navigate to and view bond/loan details on the Deal submission page
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#bond-${bondId}`));

    pages.contractSubmissionDetails.goBackLink().click();

    loanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#loan-${loanId}`));

    pages.contractSubmissionDetails.goBackLink().click();

    //---------------------------------------------------------------
    // checker returns to maker
    //---------------------------------------------------------------
    pages.contract.returnToMaker().click();
    pages.contractReturnToMaker.comments().type('Nope!');
    pages.contractReturnToMaker.returnToMaker().click();

    //---------------------------------------------------------------
    // maker submits back to checker
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    pages.contract.visit(deal);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Maker\'s input required');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Maker\'s input required');
    });

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('test');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    pages.contract.visit(deal);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });
  });
});
