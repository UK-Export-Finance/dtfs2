import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import checkYourAnswers from '../../../../../../../gef/cypress/e2e/pages/amendments/check-your-answers';
import { today } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Change cover end date with facility end date - full journey', () => {
  /**
   * @type {string}
   */
  let dealId;

  /**
   * @type {string}
   */
  let facilityId;
  /**
   * @type {string}
   */
  let amendmentId;
  /**
   * @type {Date}
   */
  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

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

        cy.url().then((url) => {
          const urlSplit = url.split('/');

          amendmentId = urlSplit[9];
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
  });

  it('should navigate through the journey correctly', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/what-do-you-need-to-change`));
    whatDoYouNeedToChange.coverEndDateCheckbox().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));
    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));
    doYouHaveAFacilityEndDate.yesRadioButton().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-end-date`));
    cy.completeDateFormFields({ idPrefix: 'facility-end-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/eligibility`));
    eligibility.allTrueRadioButtons().click({ multiple: true });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/effective-date`));
    cy.completeDateFormFields({ idPrefix: 'effective-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/check-your-answers`));

    checkYourAnswers.amendmentSummaryListTable().amendmentOptionsValue().contains('Cover end date');
    checkYourAnswers.amendmentSummaryListTable().amendmentOptionsValue().contains('Facility end date');
    checkYourAnswers.amendmentSummaryListTable().amendmentOptionsValue().should('not.contain', 'Facility value');

    checkYourAnswers.amendmentSummaryListTable().coverEndDateValue().contains(today.d_MMMM_yyyy);
    checkYourAnswers.amendmentSummaryListTable().facilityEndDateValue().contains(today.d_MMMM_yyyy);
    checkYourAnswers.amendmentSummaryListTable().bankReviewDateAction().should('not.exist');

    checkYourAnswers
      .eligibilityCriteriaSummaryListTable()
      .allEligibilityCriterionActions()
      .each(($ele, index) => {
        checkYourAnswers
          .eligibilityCriteriaSummaryListTable()
          .eligibilityCriterionValue(index + 1)
          .contains('True');
      });

    checkYourAnswers.effectiveDateSummaryListTable().effectiveDateValue().contains(today.d_MMMM_yyyy);
  });
});
