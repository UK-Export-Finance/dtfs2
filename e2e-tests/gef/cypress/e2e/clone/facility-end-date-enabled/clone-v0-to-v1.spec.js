import relative from '../../relativeURL';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import cloneGEFDeal from '../../pages/clone-deal';
import mandatoryCriteria from '../../pages/mandatory-criteria';
import nameApplication from '../../pages/name-application';
import applicationDetails from '../../pages/application-details';
import facilityEndDate from '../../pages/facility-end-date';
import bankReviewDate from '../../pages/bank-review-date';
import facilities from '../../pages/facilities';
import { submitButton } from '../../partials';
import aboutFacilityUnissued from '../../pages/unissued-facilities-about-facility';

/**
 * NOTE: These tests check the backwards compatibility with in-flight version 0 deals.
 * A migration may need to be run on production if this test is updated.
 */
context('Clone version 0 deal to version 1', () => {
  let version0DealId;
  let clonedDealId;

  before(() => {
    cy.insertVersion0Deal(BANK1_MAKER1.username).then(({ insertedId: dealId }) => {
      version0DealId = dealId;
    });
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('cloning a version 0 deal', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${version0DealId}`));

      applicationDetails.addContingentFacilityButton().click();
      facilities.hasBeenIssuedRadioYesRadioButton().click();
      cy.clickContinueButton();

      cy.visit(relative(`/gef/application-details/${version0DealId}`));

      cloneGEFDeal.cloneGefDealLink().click();
      mandatoryCriteria.trueRadio().click();

      cy.clickContinueButton();

      cy.keyboardInput(nameApplication.internalRef(), 'Cloned of v0 deal');
      cy.clickContinueButton();

      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();

      cy.getDealIdFromUrl().then((id) => {
        clonedDealId = id;
      });
    });

    beforeEach(() => {
      cy.login(BANK1_MAKER1);

      cy.visit(relative(`/gef/application-details/${clonedDealId}`));
    });

    it('shows required for has bank provided facilityEndDate', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateValue().should('contain', 'Required');
      submitButton().should('not.exist');
    });

    it('isUsingFacilityEndDate is unset on about this facility page', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();

      aboutFacilityUnissued.isUsingFacilityEndDateYes().should('not.be.checked');
      aboutFacilityUnissued.isUsingFacilityEndDateNo().should('not.be.checked');
    });

    it('facility table renders "required" for facilityEndDate after isUsingFacilityEndDate is set to true', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();
      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();
      cy.clickSaveAndReturnButton();

      applicationDetails.facilitySummaryListTable(0).facilityEndDateValue().should('contain', 'Required');
      submitButton().should('not.exist');
    });

    it('facility end date page does not show pre-populated values', () => {
      applicationDetails.facilitySummaryListTable(0).facilityEndDateAction().click();

      facilityEndDate.facilityEndDateDay().should('have.value', '');
      facilityEndDate.facilityEndDateMonth().should('have.value', '');
      facilityEndDate.facilityEndDateYear().should('have.value', '');
    });

    it('facility table renders "required" for bankReviewDate after isUsingFacilityEndDate is set to false', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();
      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();
      cy.clickSaveAndReturnButton();

      applicationDetails.facilitySummaryListTable(0).bankReviewDateValue().should('contain', 'Required');
      submitButton().should('not.exist');
    });

    it('bank review date page does not show pre-populated values', () => {
      applicationDetails.facilitySummaryListTable(0).bankReviewDateAction().click();

      bankReviewDate.bankReviewDateDay().should('have.value', '');
      bankReviewDate.bankReviewDateMonth().should('have.value', '');
      bankReviewDate.bankReviewDateYear().should('have.value', '');
    });
  });
});
