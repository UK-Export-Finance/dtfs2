const moment = require('moment');
const pages = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const miaDealReadyToSubmit = require('./MIA-deal-ready-to-submit');

const {
  fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate,
} = require('../../fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate,
} = require('../../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

context('Checker submits an MIA deal, workflow responds, Maker completes issue facility forms without cover start dates, submits deal to checker for review', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

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

        const { mockFacilities } = miaDealReadyToSubmit;

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

  it('All facilities that have been issued without cover start dates should have cover start date defaulted to todays date', () => {
    const todayFormatted = moment().format('DD/MM/YYYY');

    //---------------------------------------------------------------
    // Checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();
    pages.contract.visit(deal);

    //---------------------------------------------------------------
    // receive typeB XML with `Approved` deal status
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '016',
      },
      deal: {
        UKEF_deal_id: deal._id,
        Deal_status: 'approved',
      },
      bonds: [
        {
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: dealFacilities.loans[0]._id,
          EWCS_ukef_facility_id: '12345',
          EWCS_status: '""',
        },
      ],
    });

    //---------------------------------------------------------------
    // Maker visits the deal
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    //---------------------------------------------------------------
    // Maker completes Bond Issue Facility Form without a Cover Start Date
    //---------------------------------------------------------------
    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);
    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate();

    //---------------------------------------------------------------
    // Maker completes Loan Issue Facility Form without a Cover Start Date
    //---------------------------------------------------------------

    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);
    loanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate();

    //---------------------------------------------------------------
    // Maker submits deal for Checker review
    //---------------------------------------------------------------
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // Go back to deal page
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    //---------------------------------------------------------------
    // Bond facility should have default Cover Start Date of today
    //---------------------------------------------------------------
    bondRow.requestedCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal(todayFormatted);
    });

    //---------------------------------------------------------------
    // Loan facility should have default Cover Start Date of today
    //---------------------------------------------------------------
    loanRow.requestedCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal(todayFormatted);
    });
  });
});
