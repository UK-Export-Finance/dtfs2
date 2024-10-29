import relative from '../../relativeURL';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import cloneGEFDeal from '../../pages/clone-deal';
import mandatoryCriteria from '../../pages/mandatory-criteria';
import nameApplication from '../../pages/name-application';
import applicationDetails from '../../pages/application-details';
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

      cy.url().should('contain', relative(`/gef/application-details/`));

      cy.url().then((url) => {
        clonedDealId = url.split('/').at(-1);
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

    it('shows required for has facilityEndDate after isUsingFacilityEndDate is set to true', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();
      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();
      cy.clickSaveAndReturnButton();

      applicationDetails.facilitySummaryListTable(0).facilityEndDateValue().should('contain', 'Required');
    });

    it('shows required for has bankReviewDate after isUsingFacilityEndDate is set to false', () => {
      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().click();
      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();
      cy.clickSaveAndReturnButton();

      applicationDetails.facilitySummaryListTable(0).bankReviewDateValue().should('contain', 'Required');
    });
  });
});
