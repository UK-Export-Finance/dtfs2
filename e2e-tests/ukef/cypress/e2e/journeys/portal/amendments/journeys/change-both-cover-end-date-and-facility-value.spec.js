import { CURRENCY } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import facilityValue from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import amendmentPage from '../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';
import submittedForChecking from '../../../../../../../gef/cypress/e2e/pages/amendments/submitted-for-checking';
import amendmentSummaryList from '../../../../../../../gef/cypress/e2e/pages/amendments/amendment-summary-list';
import { today } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Change both cover end date and facility value - full journey', () => {
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
    whatDoYouNeedToChange.facilityValueCheckbox().click();
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

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-value`));
    cy.keyboardInput(facilityValue.facilityValue(), '10000');
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/eligibility`));
    eligibility.allTrueRadioButtons().click({ multiple: true });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/effective-date`));
    cy.completeDateFormFields({ idPrefix: 'effective-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/check-your-answers`));
    amendmentSummaryList.amendmentSummaryListTable().amendmentOptionsValue().contains('Cover end date');
    amendmentSummaryList.amendmentSummaryListTable().amendmentOptionsValue().contains('Facility end date');
    amendmentSummaryList.amendmentSummaryListTable().amendmentOptionsValue().contains('Facility value');

    amendmentSummaryList.amendmentSummaryListTable().coverEndDateValue().contains(today.d_MMMM_yyyy);
    amendmentSummaryList.amendmentSummaryListTable().facilityEndDateValue().contains(today.d_MMMM_yyyy);
    amendmentSummaryList.amendmentSummaryListTable().bankReviewDateChangeLink().should('not.exist');
    amendmentSummaryList.amendmentSummaryListTable().facilityValueValue().contains(`${CURRENCY.GBP} 10,000`);

    amendmentSummaryList
      .eligibilityCriteriaSummaryListTable()
      .allEligibilityCriterionChangeLinks()
      .each(($ele, index) => {
        amendmentSummaryList
          .eligibilityCriteriaSummaryListTable()
          .eligibilityCriterionValue(index + 1)
          .contains('True');
      });

    amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateValue().contains(today.d_MMMM_yyyy);
    cy.clickSubmitButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submitted-for-checking`));
    submittedForChecking.submittedForCheckingConfirmationPanel().contains('Amendment submitted for checking at your bank');
    amendmentPage.returnLink().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
