import CONSTANTS from '../../fixtures/constants';
import { anUnissuedCashFacility } from '../../../../e2e-fixtures/mock-gef-facilities';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_MIN } from '../../fixtures/mocks/mock-deals';

context('Clone GEF (MIN) deal', () => {
  let MINdealId;
  let token;
  let facilityOneId;

  const clonedDealName = 'Cloned MIN deal';

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
    before(() => {
      cy.cloneDeal(MINdealId, clonedDealName);
    });

    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
    });

    it('should validate the information in the banner and deal', () => {
      cy.document().then((doc) => {
        cy.task('htmlLog', doc.documentElement.outerHTML);

        cy.checkClonedDealBannerAndDeal(clonedDealName, 'Completed');
        cy.get('[data-cy="facility-summary-list"]').eq(0).find('.govuk-summary-list__row').eq(1).find('.govuk-summary-list__key').contains('Stage');
      });
    });
  });
});
