const pages = require('../../../../pages');
const dealReadyToSubmitWithFacilitiesIssuedInDraft = require('./deal-ready-to-submit-with-facilities-issued-in-draft');
const mockUsers = require('../../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Given a deal ready to submit with facilities issued in Draft Deal', () => {
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
    cy.insertOneDeal(dealReadyToSubmitWithFacilitiesIssuedInDraft, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Checker submits to UKEF, workflow responds; Facility statuses should be `locked` as `Completed`, even if dynamic facility validation rules are invalid', () => {
    //---------------------------------------------------------------
    // checker logs in
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);


    //---------------------------------------------------------------
    // facility statuses should be `Completed`
    //---------------------------------------------------------------
    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);


    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    //---------------------------------------------------------------
    // checker submits to UKEF
    //---------------------------------------------------------------

    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();


    //---------------------------------------------------------------
    // simulate facilities becoming invalid
    //
    // i.e remove a required Issued field or cause dates to change (the former is simpler)
    // so that facility validation *would* return invalid
    // ...and therefore, would usually mark facility status as Incomplete.
    //
    // However, for this scenario, this should not be the case.
    // Facility status (usually generated dynamically from validation), should not change.
    // Facilities in this deal were Issued during Draft stage, so on deal submit,
    // the status is manually added, overriding dynamic status generation via validation
    //
    // Business requirment is to 'Lock facility status to Completed'
    // when a deal is submitted with Issued facilities, that were issued during draft deal stage.
    //---------------------------------------------------------------
    const updatedBond = {
      ...deal.bondTransactions.items[0],
      uniqueIdentificationNumber: null,
    };
    cy.updateBond(dealId, bondId, updatedBond, MAKER_LOGIN);

    const updatedLoan = {
      ...deal.loanTransactions.items[0],
      bankReferenceNumber: null,
    };
    cy.updateLoan(dealId, loanId, updatedLoan, MAKER_LOGIN);


    //---------------------------------------------------------------
    // receive typeB XML with `Submission Acknowledged` deal status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id, // eslint-disable-line no-underscore-dangle
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '006',
      },
      deal: {
        UKEF_deal_id: deal._id, // eslint-disable-line no-underscore-dangle
        Deal_status: 'submission_acknowledged',
      },
      bonds: [
        {
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id, // eslint-disable-line no-underscore-dangle
          BSS_ukef_facility_id: '12345',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: deal.loanTransactions.items[0]._id, // eslint-disable-line no-underscore-dangle
          EWCS_ukef_facility_id: '56789',
        },
      ],
    });

    //---------------------------------------------------------------
    // facility statuses should be `Completed`
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });
  });
});
