const moment = require('moment');
const pages = require('../../../pages');
// const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

const miaDealReadyToSubmit = require('./test-data/MIA-deal-ready-to-submit');

context('Checker submits an MIA deal, workflow responds, maker/checker resubmit', () => {
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

  it('deal should be updated from MIA to MIN, submission dates displayed. MIA submission date should only be populated when deal becomes MIN', () => {
    const todayFormatted = moment().format('DD/MM/YYYY');

    //---------------------------------------------------------------
    // deal submission type & date should have expected initial text
    // Checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.eligibilitySubmissionType().contains('Manual Inclusion Application');

    pages.contract.submissionDateTableHeader().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submission date');
    });
    pages.contract.submissionDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    pages.contract.visit(deal);

    //---------------------------------------------------------------
    // only the deal submission date should be updated
    //---------------------------------------------------------------
    pages.contract.eligibilitySubmissionType().contains('Manual Inclusion Application');

    pages.contract.submissionDateTableHeader().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submission date');
    });

    pages.contract.submissionDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal(todayFormatted);
    });

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
          BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
        },
      ],
    });

    //---------------------------------------------------------------
    // Maker re-submits deal to checker for approval
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('LGTM');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // Checker re-submits deal to UKEF
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();


    //---------------------------------------------------------------
    // Deal should now:
    // - be Manual Inclusion Notice
    // - display MIA submission date
    // - display MIN submission date
    // NOTE: MIA/MIN dates are the same in this test (today)
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    pages.contract.eligibilitySubmissionType().contains('Manual Inclusion Notice');

    pages.contract.submissionDateTableHeader().invoke('text').then((text) => {
      expect(text.trim()).to.equal('MIA Submission date');
    });

    pages.contract.submissionDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal(todayFormatted);
    });

    pages.contract.eligibilityManualInclusionNoticeSubmissionDate().contains(todayFormatted);
  });
});
