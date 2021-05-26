const pages = require('../../pages');
const mockUsers = require('../../../fixtures/mockUsers');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');

const {
  fillAndSubmitIssueBondFacilityForm,
} = require('../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const MAKER_CHECKER_LOGIN = mockUsers.find((user) => (
  user.roles.includes('maker')
  && user.roles.includes('checker')
  && user.bank.name === 'Barclays Bank'));

context('Maker submits deal to checker, Maker-Checker submits to UKEF, workflow responds, Maker updates deal, workflow responds', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };


  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealReadyToSubmitForReview, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = dealReadyToSubmitForReview;

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

  it('Maker-Checker can resubmit the deal', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('test');
    pages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // Maker-Checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login(MAKER_CHECKER_LOGIN);
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();


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
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: 'Issued acknowledged',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [],
    });

    cy.sendTypeB({
      header: {
        portal_deal_id: dealId,
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
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [],
    });


    //---------------------------------------------------------------
    // Maker confirms facility start dates
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    pages.contract.visit(deal);

    let bondId = dealFacilities.bonds[1]._id; // eslint-disable-line no-underscore-dangle
    let bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    pages.facilityConfirmCoverStartDate.submit().click();


    //---------------------------------------------------------------
    // Maker submits to checker
    //---------------------------------------------------------------
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Confirmed date');
    pages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // Maker-Checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login(MAKER_CHECKER_LOGIN);
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();


    //---------------------------------------------------------------
    // We get Acknowledged status back from UKEF
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
        Deal_status: 'submission_acknowledged',
      },
      bonds: [
        {
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
        },
      ],
      loans: [],
    });

    //---------------------------------------------------------------
    // Maker issues a facility, submits to checker
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    pages.contract.visit(deal);

    bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();
    pages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
    pages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
    pages.bondIssueFacility.requestedCoverStartDateYearInput().clear();

    fillAndSubmitIssueBondFacilityForm();

    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued a facility');
    pages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // Maker-Checker can submit deal to UKEF again
    //---------------------------------------------------------------
    cy.login(MAKER_CHECKER_LOGIN);
    pages.contract.visit(deal);

    // check 'return to maker' button is enabled
    pages.contract.returnToMaker().should('be.visible');
    pages.contract.returnToMaker().should('not.be.disabled');

    pages.contract.proceedToSubmit().should('be.visible');
    pages.contract.proceedToSubmit().should('not.be.disabled');
  });
});
