const pages = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

// test data we want to set up + work with..
const dealReadyToSubmitWithAlreadySubmittedIssuedFacilities = require('./test-data/MIA-deal-ready-to-submit-with-already-submitted-issued-facilities');

context('A checker submits a deal; workflow responds with a confirmation_acknowledged status and empty facility statuses', () => {
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
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(dealReadyToSubmitWithAlreadySubmittedIssuedFacilities, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = dealReadyToSubmitWithAlreadySubmittedIssuedFacilities;

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

  it('Checker submits a deal; workflow responds; deal and facilities statuses are updated', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);
    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '011',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved_conditions',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: dealFacilities.loans[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: '',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });

    pages.contract.visit(deal);
    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Accepted by UKEF (with conditions)');
    });

    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged');
    });

    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged');
    });
  });
});
