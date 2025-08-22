import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import facilityValue from '../../../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Eligibility - page tests', () => {
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/eligibility`));
  });

  it('should render key features of the page', () => {
    eligibility.pageHeading().contains('Eligibility');
    eligibility.backLink();
  });

  it('should render all the radio buttons unselected initially', () => {
    eligibility.allTrueRadioButtons().should('not.be.checked');
    eligibility.allFalseRadioButtons().should('not.be.checked');

    eligibility.criterionRadiosText(1).contains('The Facility is not an Affected Facility');
    eligibility.criterionRadiosText(2).contains('Neither the Exporter, nor its UK Parent Obligor is an Affected Person');
  });

  it('should render an error if nothing is selected on the "Eligibility" page', () => {
    eligibility.allTrueRadioButtons().should('not.be.checked');
    eligibility.allFalseRadioButtons().should('not.be.checked');
    cy.clickContinueButton();

    eligibility.errorSummary().should('be.visible');
    eligibility.errorSummary().contains('Select if the Facility is not an Affected Facility');
    eligibility.errorSummary().contains('Select if neither the Exporter, nor its UK Parent Obligor is an Affected Person');

    eligibility.criterionInlineError(1).should('be.visible');
    eligibility.criterionInlineError(1).contains('Select if the Facility is not an Affected Facility');

    eligibility.criterionInlineError(2).should('be.visible');
    eligibility.criterionInlineError(2).contains('Select if neither the Exporter, nor its UK Parent Obligor is an Affected Person');
  });

  it('should render an error if only some items are selected on the "Eligibility" page', () => {
    eligibility.allTrueRadioButtons().should('not.be.checked');
    eligibility.allFalseRadioButtons().should('not.be.checked');

    eligibility.criterionTrueRadioButton(1).click();
    cy.clickContinueButton();

    eligibility.errorSummary().should('be.visible');
    eligibility.errorSummary().should('not.contain', 'Select if the Facility is not an Affected Facility');
    eligibility.errorSummary().contains('Select if neither the Exporter, nor its UK Parent Obligor is an Affected Person');

    eligibility.criterionInlineError(1).should('not.exist');
    eligibility.criterionTrueRadioButton(1).should('be.checked');

    eligibility.criterionInlineError(2).should('be.visible');
    eligibility.criterionInlineError(2).contains('Select if neither the Exporter, nor its UK Parent Obligor is an Affected Person');
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    eligibility.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });

  it('should navigate to the manual approval information page if "false" is selected for all criteria', () => {
    eligibility.allFalseRadioButtons().click({ multiple: true });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/manual-approval-needed`));
  });

  it('should navigate to the manual approval information page if "false" is selected for all criteria', () => {
    eligibility.allTrueRadioButtons().click({ multiple: true });
    eligibility.criterionFalseRadioButton(2).click();

    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/manual-approval-needed`));
  });

  it('should navigate to the effective from page if "true" is selected for all criteria', () => {
    eligibility.allTrueRadioButtons().click({ multiple: true });
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/effective-date`));
  });
});
