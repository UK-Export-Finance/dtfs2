import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import relative from '../../../../../relativeURL';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';
import amendmentsPage from '../../../../../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';
import { applicationPreview } from '../../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - TFM - Amendments details page - Creating an amendment while a portal amendment is in progress', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;
  let facilityUrl;
  let amendmentDetailsUrl;
  let confirmSubmissionToUkefUrl;
  let submittedUrl;

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

  it(`should not display the add amendment button when portal amendment is in ${PORTAL_AMENDMENT_STATUS.DRAFT}`, () => {
    cy.visit(relative(applicationDetailsUrl));

    applicationPreview.makeAChangeButton(facilityId).click();

    whatDoYouNeedToChange.facilityValueCheckbox().click();
    cy.clickContinueButton();

    // exits amendment to keep it in draft state
    cy.visit(relative(applicationDetailsUrl));

    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);

    cy.visit(facilityUrl);
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.addAmendmentButton().should('not.exist');
  });

  it(`should not display the add amendment button when portal amendment is ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL}`, () => {
    cy.visit(relative(applicationDetailsUrl));

    applicationPreview.makeAChangeButton(facilityId).click();

    cy.getAmendmentIdFromUrl().then((amendmentId) => {
      amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;
      confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;
      submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/approved-by-ukef`;

      cy.makerSubmitPortalAmendmentForReview({
        facilityValueExists: true,
        changedFacilityValue: CHANGED_FACILITY_VALUE,
      });

      cy.visit(TFM_URL);

      cy.tfmLogin(PIM_USER_1);

      cy.visit(facilityUrl);
      facilityPage.facilityTabAmendments().click();

      amendmentsPage.addAmendmentButton().should('not.exist');
    });
  });

  it(`should not display the add amendment button when portal amendment is ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, () => {
    // returns the amendment to the maker
    cy.login(BANK1_CHECKER1);
    cy.visit(amendmentDetailsUrl);
    cy.clickReturnToMakerButton();
    cy.clickSubmitButton();

    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);

    cy.visit(facilityUrl);
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.addAmendmentButton().should('not.exist');
  });

  it(`should display the add amendment button when portal amendment is ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}`, () => {
    // submits the amendment to UKEF
    cy.visit(amendmentDetailsUrl);
    cy.clickSubmitButton();

    cy.checkerSubmitsPortalAmendmentRequest({ amendmentDetailsUrl, submittedUrl, confirmSubmissionToUkefUrl });

    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);

    cy.visit(facilityUrl);
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.addAmendmentButton().should('exist');
  });
});
