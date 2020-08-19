const pages = require('../../../../pages');
const MIADealWithUnissuedFacilities = require('./MIA-deal-with-unissued-facilities');
const mockUsers = require('../../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find(user => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Checker submits an MIA deal with `Unissued` bonds and `Conditional` loans; workflow responds, becomes an MIN deal, maker re-submits, checker re-submits, workflow responds', () => {
  let deal;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MIADealWithUnissuedFacilities, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
      });
  });

  describe('Checker re-submits the MIN deal with `Unissued` bonds and `Conditional` loans; workflow responds', () => {
    it('Updates the statuses of `Unissued` bonds and `Conditional` loans from `Completed` to `Not started`', () => {
      //---------------------------------------------------------------
      // checker submits deal to UKEF
      //---------------------------------------------------------------
      cy.login({ ...CHECKER_LOGIN });
      pages.contract.visit(deal);

      pages.contract.eligibilitySubmissionType().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Manual Inclusion Application');
      });

      const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);


      bondRow.bondStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Unissued');
      });

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Conditional');
      });

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      pages.contract.proceedToSubmit().click();

      pages.contractConfirmSubmission.confirmSubmit().check();
      pages.contractConfirmSubmission.acceptAndSubmit().click();

      //---------------------------------------------------------------
      // receive typeB XML with `Submission Acknowledged` deal status
      //---------------------------------------------------------------
      cy.sendTypeB({
        header: {
          portal_deal_id: deal._id,
          bank_deal_id: deal.details.bankSupplyContractID,
          Message_Type: 'B',
          Action_Code: '006',
        },
        deal: {
          UKEF_deal_id: deal._id,
          Deal_status: 'submission_acknowledged',
        },
        bonds: [
          {
            BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
            BSS_ukef_facility_id: '12345',
            BSS_status: '""',
          },
        ],
        loans: [
          {
            EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
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
          Action_Code: '016',
          // Action_Code: '006',
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
        loans: [
          {
            EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
            EWCS_ukef_facility_id: '56789',
            EWCS_status: '""',
          },
        ],
      });


      //---------------------------------------------------------------
      // maker checks the deal and re-submits the deal to checker
      //---------------------------------------------------------------
      cy.login({ ...MAKER_LOGIN });
      pages.contract.visit(deal);

      // submission type should not be changed
      pages.contract.eligibilitySubmissionType().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Manual Inclusion Application');
      });

      // facility statuses should not be changed
      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      pages.contract.proceedToReview().click();
      pages.contractReadyForReview.comments().type('LGTM');
      pages.contractReadyForReview.readyForCheckersApproval().click();


      //---------------------------------------------------------------
      // checker reviews the deal and re-submits the deal to UKEF
      //---------------------------------------------------------------
      cy.login({ ...CHECKER_LOGIN });
      pages.contract.visit(deal);

      // submission type should not be changed
      pages.contract.eligibilitySubmissionType().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Manual Inclusion Application');
      });

      // facility statuses should not be changed
      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      pages.contract.proceedToSubmit().click();
      pages.contractConfirmSubmission.confirmSubmit().check();
      pages.contractConfirmSubmission.acceptAndSubmit().click();

      //---------------------------------------------------------------
      // receive typeB XML with `Submission Acknowledged` deal status
      //---------------------------------------------------------------
      cy.sendTypeB({
        header: {
          portal_deal_id: deal._id,
          bank_deal_id: deal.details.bankSupplyContractID,
          Message_Type: 'B',
          Action_Code: '006',
        },
        deal: {
          UKEF_deal_id: deal._id,
          Deal_status: 'submission_acknowledged',
        },
        bonds: [
          {
            BSS_portal_facility_id: deal.bondTransactions.items[0]._id,
            BSS_ukef_facility_id: '12345',
            BSS_status: '""',
          },
        ],
        loans: [
          {
            EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
            EWCS_ukef_facility_id: '56789',
            EWCS_status: '""',
          },
        ],
      });


      //---------------------------------------------------------------
      // go back into the deal and assert:
      // - submissionType has changed from MIA to MIN
      // - facility statuses have changed from `Completed` to `Not started`
      //---------------------------------------------------------------
      pages.contract.visit(deal);

      pages.contract.eligibilitySubmissionType().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Manual Inclusion Notice');
      });

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Not started');
      });

      // TODO: this should only be Not started for CONDITIONAL loans, not Conditional
      // this should not pass right now - need to update test data
      // assert that loan status changed from `Completed` to `Not started`
      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Not started');
      });
    });
  });
});
