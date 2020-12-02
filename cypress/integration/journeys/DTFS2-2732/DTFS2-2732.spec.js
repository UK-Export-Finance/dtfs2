// const moment = require('moment');
const relative = require('../../relativeURL');
const pages = require('../../pages');

const mockUsers = require('../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const miaDealReadyToSubmit = require('./miaDeal');

context('todo..', () => {
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
    cy.insertOneDeal(miaDealReadyToSubmit, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('should do stuff...', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();


    cy.login({ ...CHECKER_LOGIN });
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
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
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
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: '""',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [],
    });

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    pages.bondIssueFacility.requestedCoverStartDateDayInput().should('have.value', '');
    pages.bondIssueFacility.requestedCoverStartDateMonthInput().should('have.value', '');
    pages.bondIssueFacility.requestedCoverStartDateYearInput().should('have.value', '');
  });
});
