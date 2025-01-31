import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import facilityValue from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Facility value - page tests', () => {
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-value`));
  });

  it('should render key features of the page', () => {
    facilityValue.pageHeading().contains('New facility value');
    facilityValue.backLink();
    facilityValue.facilityValuePrefix().contains('£');
  });

  it('should render an error if no facility value is provided', () => {
    cy.clickContinueButton();

    facilityValue.errorSummary().should('be.visible');
    facilityValue.errorSummary().contains('Enter the new facility value in number format');

    facilityValue.facilityValueInlineError().should('be.visible');
    facilityValue.facilityValueInlineError().contains('Enter the new facility value in number format');
  });

  const errorTestCases = [
    {
      description: 'the value contains non-numeric characters',
      value: '1000x',
      expectedErrorMessage: 'Enter a valid facility value',
    },
    {
      description: 'the value contains too many decimal places',
      value: '1000.000',
      expectedErrorMessage: 'Enter a valid facility value',
    },
    {
      description: 'the value contains too many decimal points',
      value: '1000.00.0',
      expectedErrorMessage: 'Enter a valid facility value',
    },
    {
      description: 'the value contains has no leading digit',
      value: '.99',
      expectedErrorMessage: 'Enter a valid facility value',
    },
    {
      description: 'the value ends with a decimal place',
      value: '123.',
      expectedErrorMessage: 'Enter a valid facility value',
    },
    {
      description: 'the value is too small',
      value: '0.99',
      expectedErrorMessage: 'Enter a valid facility value',
    },
    {
      description: 'the value is too large',
      value: '1000000000000.01',
      expectedErrorMessage: 'The new facility value is too high',
    },
  ];

  errorTestCases.forEach(({ description, value, expectedErrorMessage }) => {
    it(`should render an error if ${description}`, () => {
      cy.keyboardInput(facilityValue.facilityValue(), value);
      cy.clickContinueButton();

      facilityValue.errorSummary().should('be.visible');
      facilityValue.errorSummary().contains(expectedErrorMessage);

      facilityValue.facilityValueInlineError().should('be.visible');
      facilityValue.facilityValueInlineError().contains(expectedErrorMessage);
    });
  });

  it.only('should navigate to cancel page when cancel is clicked', () => {
    facilityValue.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });
});
