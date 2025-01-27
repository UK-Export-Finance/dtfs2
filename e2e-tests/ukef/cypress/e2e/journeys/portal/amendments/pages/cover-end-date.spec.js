import { sub } from 'date-fns';
import { now } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import coverEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/cover-end-date';
import { sixYearsOneDay } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Cover end date - page tests', () => {
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
  let coverStartDate;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [anIssuedCashFacility({ facilityEndDateEnabled: true })], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        coverStartDate = createdFacility.details.coverStartDate ? new Date(createdFacility.details.coverStartDate) : now();
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));
  });

  it('should render key features of the page', () => {
    coverEndDate.pageHeading().contains('New cover end date');
    coverEndDate.backLink();
  });

  it('should render an error if no cover end date is provided', () => {
    cy.clickContinueButton();

    coverEndDate.errorSummary().should('be.visible');
    coverEndDate.errorSummary().contains('Enter the cover end date');

    coverEndDate.coverEndDateInlineError().should('be.visible');
    coverEndDate.coverEndDateInlineError().contains('Enter the cover end date');
  });

  it('should render an error if cover end date is invalid', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    cy.completeDateFormFields({ idPrefix: 'cover-end-date', day: 'abc', month: 'xyz', year: '123' });
    cy.clickContinueButton();

    coverEndDate.coverEndDateInlineError().should('be.visible');
    coverEndDate.coverEndDateInlineError().contains('Cover end date must be a real date');
  });

  it('should render an error if cover end date is before cover start date', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    const twoDaysBeforeCoverStartDate = sub(coverStartDate, { days: 2 });
    cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: twoDaysBeforeCoverStartDate });
    cy.clickContinueButton();

    const expectedErrorMessage = 'The new cover end date must be after the cover start date';
    coverEndDate.coverEndDateInlineError().should('be.visible');
    coverEndDate.coverEndDateInlineError().contains(expectedErrorMessage);
  });

  it('should render an error if cover end date is greater than 6 years in the future', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: sixYearsOneDay.date });
    cy.clickContinueButton();

    const expectedErrorMessage = 'The new cover end date cannot be greater than 6 years in the future';
    coverEndDate.coverEndDateInlineError().should('be.visible');
    coverEndDate.coverEndDateInlineError().contains(expectedErrorMessage);
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    coverEndDate.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });
});
