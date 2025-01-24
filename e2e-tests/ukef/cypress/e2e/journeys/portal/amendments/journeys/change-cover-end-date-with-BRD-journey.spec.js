import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import coverEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/cover-end-date';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import bankReviewDate from '../../../../../../../gef/cypress/e2e/pages/amendments/bank-review-date';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Change cover end date with bank review date - full journey', () => {
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

    whatDoYouNeedToChange.coverEndDateCheckbox().should('not.be.checked');
    whatDoYouNeedToChange.facilityValueCheckbox().should('not.be.checked');
    whatDoYouNeedToChange.pageHeading().contains('What do you need to change?');
    whatDoYouNeedToChange.backLink();
    whatDoYouNeedToChange.warning().contains('Check your records for the most up-to-date values');

    whatDoYouNeedToChange.coverEndDateCheckbox().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    coverEndDate.pageHeading().contains('New cover end date');
    coverEndDate.backLink();

    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));

    doYouHaveAFacilityEndDate.noRadioButton().should('not.be.checked');
    doYouHaveAFacilityEndDate.yesRadioButton().should('not.be.checked');
    doYouHaveAFacilityEndDate.pageHeading().contains('Do you have a facility end date?');
    doYouHaveAFacilityEndDate.backLink();

    doYouHaveAFacilityEndDate.noRadioButton().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/bank-review-date`));

    bankReviewDate.pageHeading().contains('Bank review date');
    bankReviewDate.backLink();

    cy.completeDateFormFields({ idPrefix: 'bank-review-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/eligibility`));

    eligibility.pageHeading().contains('Eligibility');
    eligibility.backLink();

    eligibility.allTrueRadioButtons().should('not.be.checked');
    eligibility.allFalseRadioButtons().should('not.be.checked');

    eligibility.criterionRadiosText(1).contains('The Facility is not an Affected Facility');
    eligibility.criterionRadiosText(2).contains('Neither the Exporter, nor its UK Parent Obligor is an Affected Person');

    eligibility.allTrueRadioButtons().click({ multiple: true });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/effective-date`));

    // TODO DTFS2-7524: add steps for effective from date

    // TODO DTFS2-7519: add steps for check your answer page
  });
});
