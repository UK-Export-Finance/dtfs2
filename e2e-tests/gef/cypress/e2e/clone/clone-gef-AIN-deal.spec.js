import relative from '../relativeURL';
import { form, mainHeading, submitButton } from '../partials';
import applicationDetails from '../pages/application-details';
import submitToUkef from '../pages/submit-to-ukef';
import aboutExporter from '../pages/about-exporter';
import cloneGEFDeal from '../pages/clone-deal';
import nameApplication from '../pages/name-application';
import mandatoryCriteria from '../pages/mandatory-criteria';
import statusBanner from '../pages/application-status-banner';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { today } from '../../../../e2e-fixtures/dateConstants';

context('Clone GEF (AIN) deal', () => {
  let AINdealId;
  let testDealId;
  let AINDealName;
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        AINdealId = body.items[2]._id;
        testDealId = body.items[1]._id;
        AINDealName = body.items[2].bankInternalRefName;
        cy.login(BANK1_MAKER1);
      });
  });

  describe('Validate the creation of a cloned deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${testDealId}`));
    });

    it('should show an error when the mandatory criteria is false', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.falseRadio().click();
      form().submit();
      cy.url().should('eq', relative('/gef/ineligible-gef'));
      mainHeading().should('contain', 'This is not eligible for a GEF guarantee');
    });

    it('should show an error when the bank internal reference is empty', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      nameApplication.internalRef().clear();
      form().submit();
      nameApplication.formError().should('contain', 'Application reference name is mandatory');
    });
  });

  describe('Clone AIN deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
    });

    it('Clone button should contain the right text and aria-label', () => {
      cloneGEFDeal.cloneGefDealLink().contains('Clone');
      cloneGEFDeal
        .cloneGefDealLink()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(`Clone deal ${AINDealName}`);
        });
    });

    it('should clone an AIN deal', () => {
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}`));
      cloneGEFDeal.cloneGefDealLink().should('be.visible');

      // Make the deal an AIN
      applicationDetails.automaticCoverDetailsLink().click();
      cy.automaticEligibilityCriteria();
      cy.clickSaveAndReturnButton();
      cy.clickSubmitButton();
      cy.clickSubmitButton();

      cy.get('[data-cy="dashboard-link"]').click();
      cy.get(`[data-cy="deal__link--${AINdealId}"]`).click();

      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone/name-application`));
      cy.keyboardInput(nameApplication.internalRef(), 'Cloned AIN deal');
      form().submit();
    });

    it('should validate the information in the banner', () => {
      cy.clickBackLink();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      cy.url().then((url) => {
        cy.visit(`${url}`);
        statusBanner.bannerStatus().contains('Draft');
        statusBanner.bannerUkefDealId().should('not.exist');
        statusBanner.bannerDateCreated().contains(today.dd_MMM_yyyy);

        applicationDetails.bankRefName().contains('Cloned AIN deal');
        applicationDetails.automaticCoverStatus().contains('Not started');
        applicationDetails.facilityStatus().contains('In progress');
        applicationDetails.exporterStatus().contains('Completed');
        submitButton().should('not.exist');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1).find('.govuk-summary-list__key').contains('Stage');
      });
    });

    it('should modify the Exporter details', () => {
      cy.clickBackLink();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      cy.url().then((url) => {
        cy.visit(`${url}/about-exporter`);
        aboutExporter.mediumRadioButton().click();
        cy.keyboardInput(aboutExporter.probabilityOfDefaultInput(), '10');
        aboutExporter.isFinancingIncreasingRadioNo().click();
        cy.clickSaveAndReturnButton();
      });
    });

    it('should clone submitted to UKEF AIN deal and reset issueDate on facilities table to -', () => {
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
      cy.clickSubmitButton();
      submitToUkef.confirmSubmissionCheckbox().click();
      cy.clickSubmitButton();

      cy.login(BANK1_MAKER1);

      cy.get(`[data-cy="deal__link--${AINdealId}"]`).click();

      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone/name-application`));
      cy.keyboardInput(nameApplication.internalRef(), 'Cloned AIN deal');
      form().submit();

      cy.get('[data-cy="success-message-link"]').click();

      applicationDetails
        .facilitySummaryListTable(0)
        .nameAction()
        .invoke('attr', 'href')
        .then((href) => {
          // get id from href for facility
          const hrefSplit = href.split('/');
          const facilityId = hrefSplit[5];

          cy.get('[data-cy="dashboard"]').click();
          // goes to facilities table and makes sure it's issued and no issue date so properly cloned
          cy.get('[data-cy="dashboard-sub-nav-link-facilities"]').click();
          cy.get(`[data-cy="facility__bankStage--${facilityId}"]`).contains('Issued');
          cy.get(`[data-cy="facility__issuedDate--${facilityId}"]`).contains('-');
        });
    });
  });
});
