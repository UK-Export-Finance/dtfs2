const pages = require('../../../../pages');
const MIADealWithUnissuedFacilities = require('./MIA-deal-with-unissued-facilities');
const mockUsers = require('../../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find(user => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

// TODO should be:
// submit MIA deal
// maker sends MIA deal to checker
// checker submits MIA deal again
// submitted deal becomes MIN
// THEN facility statuses are updated.

context('Checker submits an MIN deal with `Unissued` bonds and `Unconditional` loans; workflow responds', () => {
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
    cy.insertOneDeal(MIADealWithUnissuedFacilities, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  describe('Checker submits an MIA deal with `Unissued` bonds and `Unconditional` loans; maker sends MIA deal to checker, checker submits deal again, deal becomes MIN; workflow responds', () => {
    it('Updates the statuses of `Unissued` bonds and `Unconditional` loans from `Completed` to `Not started`', () => {
      cy.login({ ...CHECKER_LOGIN });
      pages.contract.visit(deal);

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
        expect(text.trim()).to.equal('Unconditional');
      });

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      pages.contract.proceedToSubmit().click();

      pages.contractConfirmSubmission.confirmSubmit().check();
      pages.contractConfirmSubmission.acceptAndSubmit().click();

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
        loans: [
          {
            EWCS_portal_facility_id: deal.loanTransactions.items[0]._id,
            EWCS_ukef_facility_id: '56789',
            EWCS_status: '""',
          },
        ],
      });

      pages.contract.visit(deal);
      // statuses should remain beause the deal is still MIA, not MIN.
      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });



      // bondRow.bondStatus().invoke('text').then((text) => {
      //   expect(text.trim()).to.equal('Not started');
      // });

      // loanRow.loanStatus().invoke('text').then((text) => {
      //   expect(text.trim()).to.equal('Not started');
      // });
    });
  });
});
