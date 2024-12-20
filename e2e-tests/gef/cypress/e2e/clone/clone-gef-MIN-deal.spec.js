import relative from '../relativeURL';
import { form } from '../partials';
import cloneGEFDeal from '../pages/clone-deal';
import nameApplication from '../pages/name-application';
import mandatoryCriteria from '../pages/mandatory-criteria';
import statusBanner from '../pages/application-status-banner';
import CONSTANTS from '../../fixtures/constants';
import { anUnissuedCashFacility } from '../../../../e2e-fixtures/mock-gef-facilities';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_MIN } from '../../fixtures/mocks/mock-deals';

context('Clone GEF (MIN) deal', () => {
  let MINdealId;
  let token;
  let facilityOneId;
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          MINdealId = body._id;
          cy.apiUpdateApplication(MINdealId, token, MOCK_APPLICATION_MIN).then(() => {
            cy.apiCreateFacility(MINdealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              facilityOneId = facility.body.details._id;
              cy.apiUpdateFacility(facilityOneId, token, anUnissuedCashFacility());
            });
          });
        });
      });
  });
  describe('Clone MIN deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${MINdealId}`));
    });

    it('should clone a GEF (MIN) deal', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${MINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${MINdealId}/clone/name-application`));
      cy.keyboardInput(nameApplication.internalRef(), 'Cloned MIN deal');
      form().submit();

      cy.get('[data-cy="success-message-link"]').click();
      statusBanner.bannerStatus().contains('Draft');
      statusBanner.bannerCheckedBy().contains('-');
    });
  });
});
