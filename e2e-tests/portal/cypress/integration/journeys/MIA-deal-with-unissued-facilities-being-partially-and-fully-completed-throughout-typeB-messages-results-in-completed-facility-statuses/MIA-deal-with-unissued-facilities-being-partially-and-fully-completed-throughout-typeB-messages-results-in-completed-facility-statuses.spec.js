const pages = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');
const {
  fillAndSubmitIssueBondFacilityForm,
} = require('../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityForm,
} = require('../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const miaDealReadyToSubmit = require('./miaDeal-with-unissued-facilities');

// this is for bug DTFS2-2766
context('Maker submits MIA deal to checker, cheker submits to UKEF, receive specific typeB messages, Maker completes SOME issued facilities, submits to checker, checker submits to UKEF, receive typeB message, Maker completes remaining issue facility forms', () => {
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

    cy.insertOneDeal(miaDealReadyToSubmit, MAKER_LOGIN)
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

  it('should have final facility statuses of `Completed`', () => {
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
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
        },
        {
          BSS_portal_facility_id: dealFacilities.bonds[1]._id,
          BSS_ukef_facility_id: '54321',
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
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
          BSS_comments: 'blahblah blah blahblah',
        },
        {
          BSS_portal_facility_id: dealFacilities.bonds[1]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: dealFacilities.loans[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: '""',
          EWCS_comments: 'blahblah blah blahblah',
        },
        {
          EWCS_portal_facility_id: dealFacilities.loans[1]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: '""',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });


    //---------------------------------------------------------------
    // Maker completes one bond issue facility form
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const firstBondId = dealFacilities.bonds[0]._id;
    const firstBondRow = pages.contract.bondTransactionsTable.row(firstBondId);

    firstBondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();

    //---------------------------------------------------------------
    // Maker completes one loan issue facility form
    //---------------------------------------------------------------
    const firstLoanId = dealFacilities.loans[0]._id;
    const firstLoanRow = pages.contract.loansTransactionsTable.row(firstLoanId);

    firstLoanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityForm();


    //---------------------------------------------------------------
    // Maker starts, but doesn't complete, the second/last bond issue facility form
    //---------------------------------------------------------------
    const secondBondId = dealFacilities.bonds[1]._id;
    const secondBondRow = pages.contract.bondTransactionsTable.row(secondBondId);

    secondBondRow.issueFacilityLink().click();

    pages.bondIssueFacility.uniqueIdentificationNumber().type('1234');
    pages.bondIssueFacility.submit().click();
    pages.bondIssueFacility.cancelButton().click();


    //---------------------------------------------------------------
    // Maker starts, but doesn't complete, the second/last loan issue facility form
    //---------------------------------------------------------------
    const secondLoanId = dealFacilities.loans[1]._id;
    const secondLoanRow = pages.contract.loansTransactionsTable.row(secondLoanId);

    secondLoanRow.issueFacilityLink().click();
    pages.loanIssueFacility.disbursementAmount().type('1234');
    pages.loanIssueFacility.bankReferenceNumber().type('5678');

    pages.loanIssueFacility.submit().click();
    pages.loanIssueFacility.cancelButton().click();


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
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
        },
        {
          BSS_portal_facility_id: dealFacilities.bonds[1]._id,
          BSS_ukef_facility_id: '54321',
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
      ],
    });

    //---------------------------------------------------------------
    // Maker issue the remaining incomplete/not started, unissued facilities
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    secondBondRow.issueFacilityLink().click();
    fillAndSubmitIssueBondFacilityForm();

    secondLoanRow.issueFacilityLink().click();
    fillAndSubmitIssueLoanFacilityForm();


    //---------------------------------------------------------------
    // Bond and loan stauses should be updated to Completed
    //---------------------------------------------------------------
    secondBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('Not started');
      expect(text.trim()).not.to.equal('Incomplete');
      expect(text.trim()).to.equal('Completed');
    });

    secondLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).not.to.equal('Not started');
      expect(text.trim()).not.to.equal('Incomplete');
      expect(text.trim()).to.equal('Completed');
    });
  });
});
