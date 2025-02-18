import relative from '../relativeURL';
import { form } from '../partials';
import mandatoryCriteria from '../pages/mandatory-criteria';
import nameApplication from '../pages/name-application';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

context('Name Application Page - Add element to page', () => {
  before(() => {
    cy.loadData();
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative('/gef/mandatory-criteria'));
    mandatoryCriteria.trueRadio().click();
    form().submit();
  });

  it("should not add added element's data to page", () => {
    cy.keyboardInput(nameApplication.internalRef(), 'NEW-REF-NAME');

    // adds extra populated text input element to page
    cy.insertElement('name-application-form');

    form().submit();

    cy.getDealIdFromUrl().then((dealId) => {
      cy.getApplicationById(dealId).then((deal) => {
        // checks extra field has not been added to the deal object
        expect(deal.intruder).to.be.an('undefined');
      });
    });
  });
});
