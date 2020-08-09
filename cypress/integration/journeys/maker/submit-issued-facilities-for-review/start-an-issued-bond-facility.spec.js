const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const dealAcknowledgedByUKEFWithAcknowledgedFacilityStatuses = require('./dealAcknowledgedByUKEFWithAcknowledgedFacilityStatuses');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('A maker is informed of a bond\'s status before submitting an issued bond facility with a deal in `Acknowledged by UKEF` status', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealAcknowledgedByUKEFWithAcknowledgedFacilityStatuses, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Starting to fill in the Issue Bond Facility form should change the Bond status from `Acknowledged by UKEF` to `Incomplete` and the Issue Facility link to `Facility issued`', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('be.disabled');

    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Acknowledged by UKEF');
    });

    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });
    bondRow.issueFacilityLink().click();

    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    // don't fill anything in. Submit and go back to deal page
    pages.bondIssueFacility.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));

    pages.bondIssueFacility.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // assert bond status has changed
    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    // assert `Issue facility link` text has changed
    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });
  });
});
