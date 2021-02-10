// const moment = require('moment');
const relative = require('../../../../relativeURL');
const pages = require('../../../../pages');

const mockUsers = require('../../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const miaDealReadyToSubmit = require('./miaDeal');

context('Maker/Checker submit an MIA deal with `Unissued` facilities; workflow responds', () => {
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

  afterEach(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
  });

  it('When Maker goes to issue facility form, Cover Start Date fields should be empty', () => {
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


    //---------------------------------------------------------------
    // receive typeB XML with `Approved` deal status
    //---------------------------------------------------------------
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
    // When maker goes to issue facilities, cover start date field should be empty
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    pages.bondIssueFacility.requestedCoverStartDateDayInput().should('have.value', '');
    pages.bondIssueFacility.requestedCoverStartDateMonthInput().should('have.value', '');
    pages.bondIssueFacility.requestedCoverStartDateYearInput().should('have.value', '');

    pages.contract.visit(deal);
    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    pages.loanIssueFacility.requestedCoverStartDateDayInput().should('have.value', '');
    pages.loanIssueFacility.requestedCoverStartDateMonthInput().should('have.value', '');
    pages.loanIssueFacility.requestedCoverStartDateYearInput().should('have.value', '');

    // TODO Check loan
  });
});
