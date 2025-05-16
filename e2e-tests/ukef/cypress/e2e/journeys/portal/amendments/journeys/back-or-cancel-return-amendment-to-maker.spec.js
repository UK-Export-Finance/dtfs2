import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - click back or cancel on return to maker page', () => {
  let dealId;
  let facilityId;
  let dealUrl;
  let amendmentDetailsUrl;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        dealUrl = `/gef/application-details/${dealId}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(dealUrl));
        amendmentDetailsUrl = `/gef/application-details/${dealId}/amendment-details`;

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.makerMakesPortalAmendmentRequest({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
        });
        cy.clickSubmitButton();
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_CHECKER1);
    cy.visit(amendmentDetailsUrl);
    cy.clickReturnToMakerButton();
  });

  it('should redirect to the amendment details page when pressing the back button', () => {
    cy.clickBackLink();

    cy.url().should('eq', relative(amendmentDetailsUrl));
  });

  it('should redirect to the application preview page when pressing the cancel button', () => {
    cy.clickCancelLink();

    cy.url().should('eq', relative(dealUrl));
  });
});
