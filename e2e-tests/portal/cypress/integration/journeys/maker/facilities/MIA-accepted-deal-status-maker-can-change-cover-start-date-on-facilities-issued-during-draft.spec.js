const pages = require('../../../pages');

const MIADraftDealWithIssuedFacilities = require('./fixtures/MIA-draft-deal-with-issued-facilities');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));

context('Given an MIA Deal in Draft with an Issued Bond and Unconditional Loan', () => {
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
    cy.insertOneDeal(MIADraftDealWithIssuedFacilities, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MIADraftDealWithIssuedFacilities;

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

  it('Maker submits deal to checker, Checker submits to UKEF, workflow responds, Maker can confirm facility start dates after receiving workflow response ', () => {
    cy.login({ ...MAKER_LOGIN });

    pages.contract.visit(deal);

    //---------------------------------------------------------------
    // Maker submits deal to checker
    //---------------------------------------------------------------
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Test');
    pages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // Checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    //---------------------------------------------------------------
    // Workflow responds with 'approved'
    //---------------------------------------------------------------
    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id, // eslint-disable-line no-underscore-dangle
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '017',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved_conditions',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: dealFacilities.bonds[0]._id, // eslint-disable-line no-underscore-dangle
          BSS_ukef_facility_id: '54321',
          BSS_status: '',
          BSS_comments: 'test',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: dealFacilities.loans[0]._id, // eslint-disable-line no-underscore-dangle
          EWCS_ukef_facility_id: '65432',
          EWCS_status: '',
          EWCS_comments: 'test',
        },
      ],
    });


    //---------------------------------------------------------------
    // Maker can confirm the Bond Cover Start Date
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.changeOrConfirmCoverStartDateLink().should('be.visible');

    bondRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    pages.facilityConfirmCoverStartDate.submit().click();


    //---------------------------------------------------------------
    // Maker can confirm the Loan Cover Start Date
    //---------------------------------------------------------------
    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.changeOrConfirmCoverStartDateLink().should('be.visible');

    loanRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    pages.facilityConfirmCoverStartDate.submit().click();


    //---------------------------------------------------------------
    // Maker can submit deal back to Checker again
    //---------------------------------------------------------------
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Confirmed dates');
    pages.contractReadyForReview.readyForCheckersApproval().click();
  });
});
