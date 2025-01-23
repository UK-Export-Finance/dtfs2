import { now } from '@ukef/dtfs2-common';
import { sub } from 'date-fns';
import relative from '../../../relativeURL';
import MOCK_USERS from '../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import facilityEndDate from '../../../../../../gef/cypress/e2e/pages/amendments/facility-end-date';
import { sixYearsOneDay } from '../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - change facility end date - unhappy path', () => {
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

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [anIssuedCashFacility({ facilityEndDateEnabled: true })], BANK1_MAKER1).then((createdFacility) => {
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
    cy.saveSession();
  });

  it('should render an error if nothing is selected to change', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/what-do-you-need-to-change`));

    cy.clickContinueButton();

    whatDoYouNeedToChange.errorSummary().should('be.visible');
    whatDoYouNeedToChange.errorSummary().contains('Select if you need to change the facility cover end date, value or both');

    whatDoYouNeedToChange.amendmentOptionsInlineError().should('be.visible');
    whatDoYouNeedToChange.amendmentOptionsInlineError().contains('Select if you need to change the facility cover end date, value or both');
  });

  it('should navigate to the "Do you have a facility end date?" page', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/what-do-you-need-to-change`));

    whatDoYouNeedToChange.coverEndDateCheckbox().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cover-end-date`));

    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));
  });

  it('should render an error if nothing is selected', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));

    cy.clickContinueButton();

    doYouHaveAFacilityEndDate.errorSummary().should('be.visible');
    doYouHaveAFacilityEndDate.errorSummary().contains('Select if there is an end date for this facility');

    doYouHaveAFacilityEndDate.inlineError().should('be.visible');
    doYouHaveAFacilityEndDate.inlineError().contains('Select if there is an end date for this facility');
  });

  it('should navigate to the facility end date page', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));

    doYouHaveAFacilityEndDate.yesRadioButton().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-end-date`));
  });

  it('should render an error if no facility end date is provided', () => {
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-end-date`));
    cy.clickContinueButton();

    facilityEndDate.errorSummary().should('be.visible');
    facilityEndDate.errorSummary().contains('Enter the facility end date');

    facilityEndDate.facilityEndDateInlineError().should('be.visible');
    facilityEndDate.facilityEndDateInlineError().contains('Enter the facility end date');
  });

  const facilityEndDateErrorTestCases = [
    {
      description: 'the facility end date consists of invalid characters',
      dateFieldInput: { day: 'aa', month: 11, year: 2025 },
      expectedErrorMessage: 'Facility end date must be a real date',
    },
    {
      description: 'the facility end date is missing a field',
      dateFieldInput: { day: 2, month: null, year: 2025 },
      expectedErrorMessage: 'Facility end date must include a month',
    },
    {
      description: 'the facility end date is greater than 6 years in the future',
      dateFieldInput: { date: sixYearsOneDay.date },
      expectedErrorMessage: 'Facility end date cannot be greater than 6 years in the future',
    },
    {
      description: 'the facility end date is before the cover start date',
      dateFieldInput: { date: sub(now(), { days: 2 }) },
      expectedErrorMessage: 'Facility end date cannot be before the cover start date',
    },
  ];

  facilityEndDateErrorTestCases.forEach(({ description, dateFieldInput, expectedErrorMessage }) => {
    it(`should render an error if ${description}`, () => {
      cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-end-date`));

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', ...dateFieldInput });
      cy.clickContinueButton();

      facilityEndDate.errorSummary().should('be.visible');
      facilityEndDate.errorSummary().contains(expectedErrorMessage);

      facilityEndDate.facilityEndDateInlineError().should('be.visible');
      facilityEndDate.facilityEndDateInlineError().contains(expectedErrorMessage);
    });
  });
});
