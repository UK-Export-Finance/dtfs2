import { now } from '@ukef/dtfs2-common';
import { sixYearsOneDay, tomorrow } from '@ukef/dtfs2-common/test-helpers';
import { sub } from 'date-fns';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import facilityEndDate from '../../../../../../../../../gef/cypress/e2e/pages/amendments/facility-end-date';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Facility End Date - page tests', () => {
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

        whatDoYouNeedToChange.coverEndDateCheckbox().click();
        cy.clickContinueButton();

        cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: tomorrow.date });
        cy.clickContinueButton();

        doYouHaveAFacilityEndDate.yesRadioButton().click();
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-end-date`));
  });

  it('should render key features of the page', () => {
    facilityEndDate.pageHeading().contains('Facility end date');
    facilityEndDate.backLink();
  });

  it('should render an error if no date is provided', () => {
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
    it(`should render an error on the facility end date page if ${description}`, () => {
      cy.completeDateFormFields({ idPrefix: 'facility-end-date', ...dateFieldInput });
      cy.clickContinueButton();

      facilityEndDate.errorSummary().should('be.visible');
      facilityEndDate.errorSummary().contains(expectedErrorMessage);

      facilityEndDate.facilityEndDateInlineError().should('be.visible');
      facilityEndDate.facilityEndDateInlineError().contains(expectedErrorMessage);
    });
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    facilityEndDate.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });
});
