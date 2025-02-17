import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import coverEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/cover-end-date';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
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
  let amendmentId;
  /**
   * @type {Date}
   */
  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  const testCasesWithoutFEDAndBRD = [
    {
      description: 'what do you need to change',
      page: 'what-do-you-need-to-change',
      element: whatDoYouNeedToChange,
    },
    {
      description: 'cover end date',
      page: 'cover-end-date',
      element: coverEndDate,
    },
    {
      description: 'do you have a facility end date',
      page: 'do-you-have-a-facility-end-date',
      element: doYouHaveAFacilityEndDate,
    },
    {
      description: 'facility value',
      page: 'facility-value',
      element: facilityValue,
    },
    {
      description: 'eligibility',
      page: 'eligibility',
      element: eligibility,
    },
    {
      description: 'effective date',
      page: 'effective-date',
      element: effectiveDate,
    },
    {
      description: 'check your answers',
      page: 'check-your-answers',
      element: checkYourAnswers,
    },
  ];

  testCasesWithoutFEDAndBRD.forEach(({ description, page, element }) => {
    describe(`${description}`, () => {
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

            whatDoYouNeedToChange.coverEndDateCheckbox().click();
            whatDoYouNeedToChange.facilityValueCheckbox().click();
            cy.clickContinueButton();
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

      it(`should navigate back to ${description} when "No, go back" button clicked`, () => {
        const amendmentUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;
        cy.visit(relative(`${amendmentUrl}/${page}`));
        element.cancelLink().click();
        cy.url().should('eq', relative(`${amendmentUrl}/cancel`));
        cancel.goBackButton().click();
        cy.url().should('eq', relative(`${amendmentUrl}/${page}`));
      });

      it(`should navigate back to ${description} when "Back" link clicked`, () => {
        const amendmentUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;
        cy.visit(relative(`${amendmentUrl}/${page}`));
        element.cancelLink().click();
        cy.url().should('eq', relative(`${amendmentUrl}/cancel`));
        cancel.backLink().click();
        cy.url().should('eq', relative(`${amendmentUrl}/${page}`));
      });

      it(`should cancel amendment from ${description} page`, () => {
        const amendmentUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;
        cy.visit(relative(`${amendmentUrl}/${page}`));
        element.cancelLink().click();
        cy.url().should('eq', relative(`${amendmentUrl}/cancel`));
        cancel.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      });
    });
  });
});
