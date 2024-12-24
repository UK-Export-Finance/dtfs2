import relative from '../relativeURL';
import { form, mainHeading } from '../partials';
import cloneGEFDeal from '../pages/clone-deal';
import nameApplication from '../pages/name-application';
import mandatoryCriteria from '../pages/mandatory-criteria';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

context('Clone GEF (AIN) deal - Validation', () => {
  let testDealId;
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        testDealId = body.items[1]._id;
        cy.login(BANK1_MAKER1);
      });
  });

  describe('Validate the creation of a cloned deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${testDealId}`));
    });

    it('should show an error when the mandatory criteria is false', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.falseRadio().click();
      form().submit();
      cy.url().should('eq', relative('/gef/ineligible-gef'));
      mainHeading().should('contain', 'This is not eligible for a GEF guarantee');
    });

    it('should show an error when the bank internal reference is empty', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      nameApplication.internalRef().clear();
      form().submit();
      nameApplication.formError().should('contain', 'Application reference name is mandatory');
    });
  });
});
