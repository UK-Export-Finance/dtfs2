import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import coverEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/cover-end-date';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import facilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-end-date';
import bankReviewDate from '../../../../../../../gef/cypress/e2e/pages/amendments/bank-review-date';
import facilityValue from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import effectiveDate from '../../../../../../../gef/cypress/e2e/pages/amendments/effective-date';
import checkYourAnswers from '../../../../../../../gef/cypress/e2e/pages/amendments/check-your-answers';

import cancel from '../../../../../../../gef/cypress/e2e/pages/amendments/cancel';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Cancel amendment journey', () => {
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
  let amendmentUrl;
  /**
   * @type {Date}
   */
  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  const testCasesWithoutFEDAndBRD = [
    {
      description: 'what do you need to change',
      page: 'what-do-you-need-to-change',
      element: whatDoYouNeedToChange,
      pageHeading: 'What do you need to change?',
    },
    {
      description: 'cover end date',
      page: 'cover-end-date',
      element: coverEndDate,
      pageHeading: 'New cover end date',
    },
    {
      description: 'do you have a facility end date',
      page: 'do-you-have-a-facility-end-date',
      element: doYouHaveAFacilityEndDate,
      pageHeading: 'Do you have a facility end date?',
    },
    {
      description: 'facility value',
      page: 'facility-value',
      element: facilityValue,
      pageHeading: 'New facility value',
    },
    {
      description: 'eligibility',
      page: 'eligibility',
      element: eligibility,
      pageHeading: 'Eligibility',
    },
    {
      description: 'effective date',
      page: 'effective-date',
      element: effectiveDate,
      pageHeading: 'Date amendment effective from',
    },
    {
      description: 'check your answers',
      page: 'check-your-answers',
      element: checkYourAnswers,
      pageHeading: 'Check your answers before submitting the amendment request',
    },
  ];

  const testCaseFED = [
    {
      description: 'facility end date',
      page: 'facility-end-date',
      element: facilityEndDate,
      pageHeading: 'Facility end date',
    },
  ];
  const testCaseBRD = [
    {
      description: 'bank review date',
      page: 'bank-review-date',
      element: bankReviewDate,
      pageHeading: 'Bank review date',
    },
  ];

  const setupTest = (description, page, element, pageHeading, pageActions) => {
    describe(`Cancel amendment from ${description} page`, () => {
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
              amendmentUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;
              pageActions(amendmentUrl);
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

      const runCancelTest = (action, actionDescription) => {
        it(`should ${actionDescription} from ${description} page`, () => {
          cy.visit(relative(`${amendmentUrl}/${page}`));
          element.cancelLink().click();
          cy.url().should('eq', relative(`${amendmentUrl}/cancel`));
          action().click();
          cy.url().should('eq', relative(action === cancel.continueButton ? `/gef/application-details/${dealId}` : `${amendmentUrl}/${page}`));
          if (action !== cancel.continueButton) {
            element.pageHeading().contains(pageHeading);
          }
        });
      };

      runCancelTest(cancel.goBackButton, 'navigate back when "No, go back" button clicked');
      runCancelTest(cancel.backLink, 'navigate back when "Back" link clicked');
      runCancelTest(cancel.continueButton, 'cancel amendment');
    });
  };

  testCasesWithoutFEDAndBRD.forEach(({ description, page, element, pageHeading }) => {
    const pageActions = () => {
      whatDoYouNeedToChange.coverEndDateCheckbox().click();
      whatDoYouNeedToChange.facilityValueCheckbox().click();
      cy.clickContinueButton();
    };
    setupTest(description, page, element, pageHeading, pageActions);
  });

  testCaseFED.forEach(({ description, page, element, pageHeading }) => {
    const pageActions = () => {
      whatDoYouNeedToChange.coverEndDateCheckbox().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
      cy.clickContinueButton();
      doYouHaveAFacilityEndDate.yesRadioButton().click();
      cy.clickContinueButton();
    };
    setupTest(description, page, element, pageHeading, pageActions);
  });

  testCaseBRD.forEach(({ description, page, element, pageHeading }) => {
    const pageActions = () => {
      whatDoYouNeedToChange.coverEndDateCheckbox().click();
      whatDoYouNeedToChange.facilityValueCheckbox().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
      cy.clickContinueButton();
      doYouHaveAFacilityEndDate.noRadioButton().click();
      cy.clickContinueButton();
    };
    setupTest(description, page, element, pageHeading, pageActions);
  });
});
