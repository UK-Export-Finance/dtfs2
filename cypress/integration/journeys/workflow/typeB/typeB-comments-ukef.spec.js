const {
  contract, contractConfirmSubmission, contractComments,
} = require('../../../pages');
const { ukefComments } = require('../../../partials');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

// test data we want to set up + work with..
const dealReadyToSubmit = require('./test-data/dealReadyToSubmit');


context('A checker submits an approval for a deal; workflow responds with a typeB', () => {
  let goodDeal; let
    badDeal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.insertManyDeals([dealReadyToSubmit()], MAKER_LOGIN)
      .then((insertedDeals) => {
        goodDeal = insertedDeals[0];
      });
  });

  it('Checker submits a deal; workflow approves without comments.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: goodDeal._id,
        bank_deal_id: goodDeal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '006',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved',
        Deal_comments: '',
      },
      bonds: [
        {
          BSS_portal_facility_id: goodDeal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: 'Issued acknowledged',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: goodDeal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: 'Issued acknowledged',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });

    contract.visit(goodDeal);
    ukefComments.comments.title().should('not.exist');
    ukefComments.comments.text().should('not.exist');
    ukefComments.specialCondition.title().should('not.exist');
    ukefComments.specialCondition.text().should('not.exist');

    contract.commentsTab().click();
    ukefComments.comments.title().should('not.exist');
    ukefComments.comments.text().should('not.exist');
    ukefComments.specialCondition.title().should('not.exist');
    ukefComments.specialCondition.text().should('not.exist');

    contract.previewTab().click();
    ukefComments.comments.title().should('not.exist');
    ukefComments.comments.text().should('not.exist');
    ukefComments.specialCondition.title().should('not.exist');
    ukefComments.specialCondition.text().should('not.exist');
  });

  it('Checker submits a deal; workflow approves with comments.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: goodDeal._id,
        bank_deal_id: goodDeal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '006',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved',
        Deal_comments: 'ukef comments text',
      },
      bonds: [
        {
          BSS_portal_facility_id: goodDeal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: 'Issued acknowledged',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: goodDeal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: 'Issued acknowledged',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });

    contract.visit(goodDeal);
    ukefComments.comments.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('UKEF Comments:');
    });
    ukefComments.comments.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('ukef comments text');
    });

    contract.commentsTab().click();
    ukefComments.comments.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('UKEF Comments:');
    });
    ukefComments.comments.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('ukef comments text');
    });

    contract.previewTab().click();
    ukefComments.comments.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('UKEF Comments:');
    });
    ukefComments.comments.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('ukef comments text');
    });
  });

  it('Checker submits a deal; workflow approves with special conditions.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: goodDeal._id,
        bank_deal_id: goodDeal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '007',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'approved_conditions',
        Deal_comments: 'special condition text',
      },
      bonds: [
        {
          BSS_portal_facility_id: goodDeal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: 'Issued acknowledged',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: goodDeal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: 'Issued acknowledged',
          EWCS_comments: 'blahblah blah blahblah',
        },

      ],
    });

    contract.visit(goodDeal);
    ukefComments.specialCondition.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Special Conditions:');
    });
    ukefComments.specialCondition.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('special condition text');
    });

    contract.commentsTab().click();
    ukefComments.specialCondition.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Special Conditions:');
    });
    ukefComments.specialCondition.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('special condition text');
    });

    contract.previewTab().click();
    ukefComments.specialCondition.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Special Conditions:');
    });
    ukefComments.specialCondition.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('special condition text');
    });
  });

  it('Checker submits a deal; workflow rejects with comments.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: goodDeal._id,
        bank_deal_id: goodDeal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '006',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'refused',
        Deal_comments: 'ukef comments refuse text',
      },
      bonds: [
        {
          BSS_portal_facility_id: goodDeal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: 'Issued acknowledged',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: goodDeal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: 'Issued acknowledged',
          EWCS_comments: 'blahblah blah blahblah',
        },
      ],
    });

    contract.visit(goodDeal);
    ukefComments.comments.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Reason for rejection:');
    });
    ukefComments.comments.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('ukef comments refuse text');
    });

    contract.commentsTab().click();
    ukefComments.comments.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Reason for rejection:');
    });
    ukefComments.comments.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('ukef comments refuse text');
    });

    contract.previewTab().click();
    ukefComments.comments.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Reason for rejection:');
    });
    ukefComments.comments.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal('ukef comments refuse text');
    });
  });
});
