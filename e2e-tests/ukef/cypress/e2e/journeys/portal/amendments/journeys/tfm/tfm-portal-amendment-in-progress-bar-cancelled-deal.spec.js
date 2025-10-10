import relative from '../../../../../relativeURL';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import amendmentsPage from '../../../../../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';
import { applicationPreview } from '../../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - TFM - Amendments details page - Portal amendment in progress bar when a deal is cancelled', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;
  let facilityUrl;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;

        facilityUrl = `${TFM_URL}/case/${dealId}/facility/${facilityId}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();

    cy.login(BANK1_MAKER1);
    cy.saveSession();
  });

  it('should not display a portal amendment in progress bar when portal amendment is in progress and the deal is cancelled', () => {
    cy.visit(relative(applicationDetailsUrl));

    applicationPreview.makeAChangeButton(facilityId).click();

    cy.makerSubmitPortalAmendmentForReview({
      facilityValueExists: true,
      changedFacilityValue: CHANGED_FACILITY_VALUE,
    });

    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);

    const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;

    cy.visit(tfmDealPage);

    cy.submitDealCancellation({ dealId });

    cy.visit(tfmDealPage);

    amendmentsPage.portalAmendmentInProgressDealBar().should('not.exist');

    cy.visit(facilityUrl);

    amendmentsPage.portalAmendmentInProgressBar().should('not.exist');
  });
});
