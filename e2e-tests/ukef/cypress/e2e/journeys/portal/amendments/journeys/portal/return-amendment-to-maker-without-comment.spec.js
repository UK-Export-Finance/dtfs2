import relative from '../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../gef/cypress/e2e/pages';
import applicationDetails from '../../../../../../../../gef/cypress/e2e/pages/application-details';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '20000';

const comment = 'Test comment';

context('Amendments - return amendment to maker without comments', () => {
  let dealId;
  let facilityId;
  let dealUrl;
  let amendmentDetailsUrl;
  let returnedToMakerUrl;

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

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

          returnedToMakerUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/returned-to-maker`;

          cy.makerMakesPortalAmendmentRequest({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
          });
          cy.clickSubmitButton();
        });
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
    cy.clickSubmitButton();

    cy.url().should('eq', relative(returnedToMakerUrl));
  });

  it('should NOT display the comment on application preview page', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(relative(dealUrl));

    applicationDetails.comments().should('not.contain', comment);
  });
});
