import relative from '../relativeURL';
import returnToMaker from '../pages/return-to-maker';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from '../pages/application-details';
import automaticCover from '../pages/automatic-cover';
import manualInclusion from '../pages/manual-inclusion-questionnaire';
import securityDetails from '../pages/security-details';
import applicationSubmission from '../pages/application-submission';
import applicationPreview from '../pages/application-preview';
import statusBanner from '../pages/application-status-banner';

let dealId;

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

context('Return to Maker as MIA', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id;

        cy.login(BANK1_MAKER1);
      });
  });

  describe('create and submit an MIA', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('create an MIA as a Maker and submit it to the Checker', () => {
      applicationDetails.automaticCoverDetailsLink().click();

      // Accept all ECs
      cy.automaticEligibilityCriteria();
      // Deny EC
      automaticCover.falseRadioButton(19).click();

      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));
      cy.uploadFile('upload-file-valid.doc', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');
      securityDetails.visit(dealId);
      cy.keyboardInput(securityDetails.exporterSecurity(), 'test');
      cy.keyboardInput(securityDetails.facilitySecurity(), 'test2');
      cy.clickSubmitButton();

      cy.clickSubmitButton();
      cy.clickSubmitButton();
      applicationSubmission.confirmationPanelTitle();
    });
  });

  describe('return the application to the Maker', () => {
    before(() => {
      cy.login(BANK1_CHECKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should return the application to the Maker', () => {
      applicationPreview.supportingInfoListRowAction(0, 0).should('not.exist');
      applicationPreview.supportingInfoListRowAction(0, 1).should('not.exist');
      applicationPreview.returnButton().click();
      cy.keyboardInput(returnToMaker.comment(), 'comment1');
      cy.clickSubmitButton();
      cy.location('pathname').should('contain', 'dashboard');
    });
  });

  describe('return to maker', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('comments are showing and application details page should be fully unlocked', () => {
      applicationPreview.comments().contains(`Comments from ${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);
      applicationPreview.comments().contains('comment1');
      statusBanner.bannerStatus().contains("Further Maker's input required");

      // should be able to add and delete facilities
      applicationDetails.addCashFacilityButton().should('exist');
      applicationDetails.addContingentFacilityButton().should('exist');
      applicationDetails.deleteFacilityLink().should('exist');

      // should be able to edit facilities
      applicationDetails.facilitySummaryListTable(0).nameAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).hasBeenIssuedAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).monthsOfCoverAction().contains('Change');
      if (facilityEndDateEnabled) {
        applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().contains('Change');
        applicationDetails.facilitySummaryListTable(0).facilityEndDateAction().contains('Change');
      }
      applicationDetails.facilitySummaryListTable(0).facilityProvidedOnAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).valueAction().contains('Change');

      // should be able to edit company house reg number
      applicationDetails.exporterSummaryListRowAction(0, 0).contains('Change');

      // should be able to edit eligibility criteria
      applicationDetails.automaticCoverSummaryListRowAction(0, 0).contains('Change');
      applicationDetails
        .automaticCoverSummaryListRowAction(0, 0)
        .find('.govuk-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`${dealId}/automatic-cover`);
        });

      // abandon link should exist
      applicationDetails.abandonLink().should('exist');
      applicationDetails
        .abandonLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/application-details/${dealId}/abandon`);
        });
      // should be able to edit ref name
      applicationDetails.editRefNameLink().should('exist');
      applicationDetails
        .editRefNameLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/applications/${dealId}/name`);
        });
      // supporting info should show change link
      applicationDetails.supportingInfoListRowAction(0, 0).contains('Change');
      applicationDetails
        .supportingInfoListRowAction(0, 0)
        .find('.govuk-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`);
        });
      applicationDetails.supportingInfoListRowAction(0, 1).contains('Change');
      applicationDetails
        .supportingInfoListRowAction(0, 1)
        .find('.govuk-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/application-details/${dealId}/supporting-information/security-details`);
        });
    });

    it('can change security details comments', () => {
      securityDetails.securityDetailsChangeCta().click();
      cy.keyboardInput(securityDetails.exporterSecurity(), ' test3');
      cy.keyboardInput(securityDetails.facilitySecurity(), 'test4');
      cy.clickSubmitButton();
    });

    it('can submit back to checker', () => {
      cy.clickSubmitButton();
      cy.clickSubmitButton();
      applicationSubmission.confirmationPanelTitle().contains('Manual inclusion application submitted for checking at your bank');
      cy.visit(relative(`/gef/application-details/${dealId}`));
      statusBanner.bannerStatus().contains("Ready for Checker's approval");
    });
  });
});
