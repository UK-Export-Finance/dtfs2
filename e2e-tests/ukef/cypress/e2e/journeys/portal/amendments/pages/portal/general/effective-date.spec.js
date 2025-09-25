import { twoDaysAgo, twoMonths } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import facilityValue from '../../../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import effectiveDate from '../../../../../../../../../gef/cypress/e2e/pages/amendments/effective-date';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Date amendment effective from - page tests', () => {
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

        whatDoYouNeedToChange.facilityValueCheckbox().click();
        cy.clickContinueButton();
        cy.keyboardInput(facilityValue.facilityValue(), '10000');
        cy.clickContinueButton();
        eligibility.allTrueRadioButtons().click({ multiple: true });
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/effective-date`));
  });

  it('should render key features of the page', () => {
    effectiveDate.pageHeading().contains('Date amendment effective from');
    effectiveDate.backLink();
    effectiveDate.cancelLink();
  });

  it('should render an error if no date is provided', () => {
    cy.clickContinueButton();

    effectiveDate.errorSummary().should('be.visible');
    effectiveDate.errorSummary().contains('Enter the date amendment effective from');

    effectiveDate.effectiveDateInlineError().should('be.visible');
    effectiveDate.effectiveDateInlineError().contains('Enter the date amendment effective from');
  });

  const effectiveDateErrorTestCases = [
    {
      description: 'the date amendment effective from consists of invalid characters',
      dateFieldInput: { day: 'aa', month: '11', year: '2025' },
      expectedErrorMessage: 'Date amendment effective from must be a real date',
    },
    {
      description: 'the date amendment effective from is missing a field',
      dateFieldInput: { day: '2', month: ' ', year: '2025' },
      expectedErrorMessage: 'Date amendment effective from must include a month',
    },
    {
      description: 'the date amendment effective from is greater than 30 days in the future',
      dateFieldInput: twoMonths,
      expectedErrorMessage: `You entered an amendment date more than 30 days from now. Amendments must be effective within the next 30 days - come back later or use the Schedule 8 form`,
    },
    {
      description: 'the date amendment effective from is before the cover start date',
      dateFieldInput: twoDaysAgo,
      expectedErrorMessage: 'The date entered is invalid. Please ensure the date entered does not exceed the allowable timeframe',
    },
  ];

  effectiveDateErrorTestCases.forEach(({ description, dateFieldInput, expectedErrorMessage }) => {
    it(`should render an error on the bank review date page if ${description}`, () => {
      cy.completeDateFormFields({ idPrefix: 'effective-date', ...dateFieldInput });
      cy.clickContinueButton();

      effectiveDate.errorSummary().should('be.visible');
      effectiveDate.errorSummary().contains(expectedErrorMessage);
      effectiveDate.effectiveDateInlineError().should('be.visible');
      effectiveDate.effectiveDateInlineError().contains(expectedErrorMessage);
    });
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    eligibility.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });
});
