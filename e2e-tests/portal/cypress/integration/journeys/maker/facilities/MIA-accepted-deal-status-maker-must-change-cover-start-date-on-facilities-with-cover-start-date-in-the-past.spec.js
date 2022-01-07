const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast = require('./fixtures/MIA-deal-with-accepted-status-issued-facilities-cover-start-date-in-past');
const mockUsers = require('../../../../fixtures/mockUsers');
const { nowPlusMonths } = require('../../../../support/utils/dateFuncs');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

context('Given a deal that has `Accepted` status with Issued, Unissued, Unconditional and Conditional facilities', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast;

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
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });
  });

  it('Maker can `Confirm or change start date` for Issued & Unconditional facilities and only resubmit the deal once all Issued & Unconditional facilities have had their start date confirmed', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const issuedSubmittedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Issued' && b.status === 'Submitted');

    const unconditionalSubmittedLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const issuedSubmittedBondId = issuedSubmittedBond._id;
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id;
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    //---------------------------------------------------------------
    // Maker must change Cover start date for Bond facility when existing cover start date is in the past
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${issuedSubmittedBondId}/confirm-requested-cover-start-date`));

    const NEW_BOND_COVER_START_DATE = () => {
      const date = new Date(parseInt(deal.details.submissionDate, 10));
      date.setDate(date.getDate() + 7);
      return date;
    };

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().should('not.exist');
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().should('not.exist');
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_BOND_COVER_START_DATE().getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_BOND_COVER_START_DATE().getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_BOND_COVER_START_DATE().getFullYear());
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));


    //---------------------------------------------------------------
    // Maker must change Cover start date for Loan facility when existing cover start date is in the past
    //---------------------------------------------------------------
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalSubmittedLoanId}/confirm-requested-cover-start-date`));

    const NEW_LOAN_COVER_START_DATE = nowPlusMonths(1);

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().should('not.exist');
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().should('not.exist');
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_LOAN_COVER_START_DATE.getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_LOAN_COVER_START_DATE.getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_LOAN_COVER_START_DATE.getFullYear());
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));


    //---------------------------------------------------------------
    // `confirm start date` link/text should be updated
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');


    //---------------------------------------------------------------
    // Maker can resubmit deal now, after all cover start dates have been changed/confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated cover start dates');
    pages.contractReadyForReview.readyForCheckersApproval().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
