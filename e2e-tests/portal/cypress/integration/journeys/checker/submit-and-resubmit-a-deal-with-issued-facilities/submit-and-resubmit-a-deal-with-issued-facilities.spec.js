const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithUnIssuedFacilities = require('./dealWithUnIssuedFacilities');
const mockUsers = require('../../../../fixtures/mockUsers');
const {
  fillAndSubmitIssueBondFacilityForm,
} = require('../../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityForm,
} = require('../../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));

context('A maker submits a deal to checker, checker submits to UKEF, maker submits issued loan/bond facilities, checker returns to maker, maker submits to checker', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

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

        const { mockFacilities } = dealWithUnIssuedFacilities;

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
  });;

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
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
        },
        {
          BSS_portal_facility_id: dealFacilities.bonds[1]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
        },
        {
          BSS_portal_facility_id: dealFacilities.bonds[2]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: dealFacilities.loans[0]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
        {
          EWCS_portal_facility_id: dealFacilities.loans[1]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
        {
          EWCS_portal_facility_id: dealFacilities.loans[2]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
      ],
    });

    //---------------------------------------------------------------
    // maker adds Issued Facilities
    // issued facility status/links should be updated/hidden
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    pages.contract.visit(deal);

    const bondThatWillBeIssuedObj = dealFacilities.bonds.find((b) => !b.status);
    const bondThatWillBeIssuedId = bondThatWillBeIssuedObj._id; // eslint-disable-line no-underscore-dangle
    const bondThatWillBeIssuedRow = pages.contract.bondTransactionsTable.row(bondThatWillBeIssuedId);

    const loanThatWillBeIssuedObj = dealFacilities.loans.find((l) => !l.status);

    const loanThatWillBeIssuedId = loanThatWillBeIssuedObj._id; // eslint-disable-line no-underscore-dangle
    const loanThatWillBeIssuedIdRow = pages.contract.loansTransactionsTable.row(loanThatWillBeIssuedId);

    bondThatWillBeIssuedRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    bondThatWillBeIssuedRow.deleteLink().should('not.exist');

    loanThatWillBeIssuedIdRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    loanThatWillBeIssuedIdRow.deleteLink().should('not.exist');

    bondThatWillBeIssuedRow.issueFacilityLink().click();
    fillAndSubmitIssueBondFacilityForm();

    bondThatWillBeIssuedRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    loanThatWillBeIssuedIdRow.issueFacilityLink().click();
    fillAndSubmitIssueLoanFacilityForm();

    loanThatWillBeIssuedIdRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    //---------------------------------------------------------------
    // maker starts, but does not complete, a different Bond Issue Facility form
    //---------------------------------------------------------------
    const unissuedNotStartedBondObj = dealFacilities.bonds.find((bond) => !bond.status && bond._id !== bondThatWillBeIssuedId); // eslint-disable-line no-underscore-dangle
    const unissuedNotStartedBondId = unissuedNotStartedBondObj._id; // eslint-disable-line no-underscore-dangle
    const unissuedNotStartedBondRow = pages.contract.bondTransactionsTable.row(unissuedNotStartedBondId);

    const unissuedIncompleteBondObj = dealFacilities.bonds.find((bond) =>
      !bond.status
      && bond._id !== bondThatWillBeIssuedId // eslint-disable-line no-underscore-dangle
      && bond._id !== unissuedNotStartedBondId); // eslint-disable-line no-underscore-dangle

    const unissuedIncompleteBondId = unissuedIncompleteBondObj._id; // eslint-disable-line no-underscore-dangle
    const unissuedIncompleteBondRow = pages.contract.bondTransactionsTable.row(unissuedIncompleteBondId);

    unissuedIncompleteBondRow.issueFacilityLink().click();

    pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');
    pages.bondIssueFacility.submit().click();
    pages.bondIssueFacility.cancelButton().click();

    unissuedIncompleteBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Incomplete');
    });

    //---------------------------------------------------------------
    // maker starts, but does not complete, a different Loan Issue Facility form
    //---------------------------------------------------------------

    const conditionalNotStartedLoanObj = dealFacilities.loans.find((loan) => !loan.status && loan._id !== loanThatWillBeIssuedId); // eslint-disable-line no-underscore-dangle
    const conditionalNotStartedLoanId = conditionalNotStartedLoanObj._id; // eslint-disable-line no-underscore-dangle
    const conditionalNotStartedLoanRow = pages.contract.loansTransactionsTable.row(conditionalNotStartedLoanId);

    const conditionalIncompleteLoanObj = dealFacilities.loans.find((loan) =>
      !loan.status
      && loan._id !== loanThatWillBeIssuedId // eslint-disable-line no-underscore-dangle
      && loan._id !== conditionalNotStartedLoanId); // eslint-disable-line no-underscore-dangle

    const conditionalIncompleteLoanId = conditionalIncompleteLoanObj._id; // eslint-disable-line no-underscore-dangle
    const conditionalIncompleteLoanRow = pages.contract.loansTransactionsTable.row(conditionalIncompleteLoanId);

    conditionalIncompleteLoanRow.issueFacilityLink().click();

    pages.loanIssueFacility.bankReferenceNumber().type('1234');
    pages.loanIssueFacility.submit().click();
    pages.loanIssueFacility.cancelButton().click();

    conditionalIncompleteLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Incomplete');
    });

    //---------------------------------------------------------------
    // maker submits deal for checker review
    //---------------------------------------------------------------
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker can navigate to and view bond/loan details on the Deal submission page
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);

    bondThatWillBeIssuedRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    loanThatWillBeIssuedIdRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    bondThatWillBeIssuedRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#bond-${bondThatWillBeIssuedId}`));

    pages.contractSubmissionDetails.goBackLink().click();

    loanThatWillBeIssuedIdRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#loan-${loanThatWillBeIssuedId}`));

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

    bondThatWillBeIssuedRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Maker\'s input required');
    });

    loanThatWillBeIssuedIdRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Maker\'s input required');
    });

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('test');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker submits deal to ukef
    // completed, issued facilities should have status updated to Submitted
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);

    bondThatWillBeIssuedRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    loanThatWillBeIssuedIdRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    pages.contract.visit(deal);

    bondThatWillBeIssuedRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    loanThatWillBeIssuedIdRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    //---------------------------------------------------------------
    // unissued bonds that have not been started should retain status
    //---------------------------------------------------------------
    unissuedNotStartedBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    //---------------------------------------------------------------
    // unissued bonds that are incomplete (because Issue Facility form is incomplete/has validation errors)
    // should retain status
    //---------------------------------------------------------------
    unissuedIncompleteBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Incomplete');
    });

    //---------------------------------------------------------------
    // unissued loans that have not been started should retain status
    //---------------------------------------------------------------
    conditionalNotStartedLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    //---------------------------------------------------------------
    // unissued loans that are incomplete (because Issue Facility form is incomplete/has validation errors)
    // should retain status
    //---------------------------------------------------------------
    conditionalIncompleteLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Incomplete');
    });

  });
});
