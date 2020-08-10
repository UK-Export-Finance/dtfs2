const moment = require('moment');
const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealAcknowledgedByUKEFWithNotStartedFacilityStatuses = require('./dealAcknowledgedByUKEFWithNotStartedFacilityStatuses');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('A maker can issue and submit an issued bond facility with a deal in `Acknowledged by UKEF` status', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealAcknowledgedByUKEFWithNotStartedFacilityStatuses, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  const fillAndSubmitIssueBondFacilityForm = () => {
    const issuedDate = moment().add(1, 'day');
    pages.bondIssueFacility.issuedDateDayInput().type(issuedDate.format('DD'));
    pages.bondIssueFacility.issuedDateMonthInput().type(issuedDate.format('MM'));
    pages.bondIssueFacility.issuedDateYearInput().type(issuedDate.format('YYYY'));

    const requestedCoverStartDate = moment().add(2, 'day');
    pages.bondIssueFacility.requestedCoverStartDateDayInput().type(requestedCoverStartDate.format('DD'));
    pages.bondIssueFacility.requestedCoverStartDateMonthInput().type(requestedCoverStartDate.format('MM'));
    pages.bondIssueFacility.requestedCoverStartDateYearInput().type(requestedCoverStartDate.format('YYYY'));

    const coverEndDate = moment().add(1, 'month');
    pages.bondIssueFacility.coverEndDateDayInput().type(coverEndDate.format('DD'));
    pages.bondIssueFacility.coverEndDateMonthInput().type(coverEndDate.format('MM'));
    pages.bondIssueFacility.coverEndDateYearInput().type(coverEndDate.format('YYYY'));

    pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');

    pages.bondIssueFacility.submit().click();
  };

  it('Completing the Issue bond Facility form allows maker to re-submit the deal for review. Deal/bond should be updated after submiting for review', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('be.disabled');

    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });

    bondRow.issueFacilityLink().click();

    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();

    cy.url().should('eq', relative(`/contract/${dealId}`));

    // expect issue facility link text to be changed
    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    // submit deal for review
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued a bond');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page
    cy.url().should('include', '/dashboard');

    pages.contract.visit(deal);

    // expect the deal status to be updated
    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });

    // expect the bond status to be updated
    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    // expect bond issue facility link text to be changed
    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    // since no other facilities have had their details/forms completed
    // and the deal is now has `Ready for Checker\'s approval` status
    // Proceed to Review and Abandon buttons should be disabled.
    pages.contract.proceedToReview().should('be.disabled');
    pages.contract.abandonButton().should('be.disabled');
  });
});
