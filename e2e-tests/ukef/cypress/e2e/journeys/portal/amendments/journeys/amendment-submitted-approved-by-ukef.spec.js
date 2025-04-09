import { today } from '../../../../../../../e2e-fixtures/dateConstants';
import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

import amendmentPage from '../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';
import approvedByUkef from '../../../../../../../gef/cypress/e2e/pages/amendments/approved-by-ukef';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '10000';

context('Amendments - Amendment details page', () => {
  let dealId;
  let facilityId;
  let submittedUrl;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(`/gef/application-details/${dealId}`));

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/approved-by-ukef`;
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
    cy.login(BANK1_MAKER1);
    cy.visit(submittedUrl);
  });

  it('should render a panel with the correct text', () => {
    approvedByUkef.approvedByUkefPanel().should('exist');
    approvedByUkef.approvedByUkefPanel().contains('Amendment approved by UKEF');

    cy.assertText(approvedByUkef.amendmentReference(), 'Amendment reference is undefined');
    cy.assertText(approvedByUkef.confirmationEmail(), "We've sent you a confirmation email.");
  });

  it('should render a "what happens next" section', () => {
    cy.assertText(amendmentPage.header(), 'What happens next?');

    const todayFormatted = today.d_MMMM_yyyy;

    cy.assertText(approvedByUkef.approvedAmendmentsEffectiveDate(), `We have approved your amendments and they will take effect from ${todayFormatted}`);
  });

  it('should render a return link', () => {
    cy.assertText(amendmentPage.returnLink(), 'Return to all applications and notices');

    amendmentPage
      .returnLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/dashboard/deals`);
      });
  });
});
