import relative from './relativeURL';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import facilities from './pages/facilities';
import CREDENTIALS from '../fixtures/credentials.json';

let applications;

context('Application Details Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applications = body.items;
      });

    cy.login(CREDENTIALS.MAKER);
  });

  describe('Visiting page for the first time - NOT STARTED', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${applications[0]._id}`));
    });

    it('displays the application banner', () => {
      applicationDetails.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.editRefNameLink().should('have.text', 'Barclays 123');
    });

    it('displays the correct headings', () => {
      applicationDetails.applicationDetailsPage();
      applicationDetails.captionHeading();
      applicationDetails.mainHeading();
    });

    it('shows a valid link to edit the reference', () => {
      applicationDetails.editRefNameLink().click();
      cy.url().should('eq', relative(`/gef/applications/${applications[0]._id}/name`));
    });

    it('displays the correct exporter elements', () => {
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains('Not started');
      applicationDetails.exporterDetailsLink();
      applicationDetails.exporterSummaryList().should('not.exist');
    });

    it('displays the correct automatic-cover elements', () => {
      applicationDetails.automaticCoverHeading();
      applicationDetails.automaticCoverStatus().contains('Not started');
      applicationDetails.automaticCoverDetailsLink();
      applicationDetails.automaticCoverSummaryList().should('not.exist');
      applicationDetails.automaticCoverSummaryList().should('not.exist');
    });

    it('displays the correct facility elements', () => {
      applicationDetails.facilityHeading();
      applicationDetails.facilityStatus().contains('Not started');
      applicationDetails.addCashFacilityButton();
      applicationDetails.addContingentFacilityButton();
      applicationDetails.facilitySummaryList().should('not.exist');
    });

    it('displays the correct submit elements', () => {
      applicationDetails.submitHeading();
      applicationDetails.submitButton().should('not.exist');
      applicationDetails.submitValidationText();
    });

    it('takes you to companies house page when clicking on `Enter details`', () => {
      applicationDetails.exporterDetailsLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[0]._id}/companies-house`));
    });

    it('keeps you on the same page for now when clicking on `Abandon` link', () => {
      applicationDetails.abandonLink().click();
      cy.visit(relative(`/gef/application-details/${applications[0]._id}`));
      cy.url().should('eq', relative(`/gef/application-details/${applications[0]._id}`));
    });

    it('takes you to Cash facility page when clicking on `Add a cash facility` button', () => {
      applicationDetails.addCashFacilityButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[0]._id}/facilities`));
      facilities.hasBeenIssuedHeading().contains('cash');
    });

    it('takes you to Contingent facility page when clicking on `Add a contingent facility` button', () => {
      applicationDetails.addContingentFacilityButton().click();
      cy.visit(relative(`/gef/application-details/${applications[0]._id}/facilities?facilityType=CONTINGENT`));
    });
  });

  describe('Visiting page when IN PROGRESS status', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${applications[1]._id}`));
    });

    it('displays the application banner', () => {
      applicationDetails.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.editRefNameLink().should('have.text', 'UKEF Test 123');
    });

    it('displays the correct exporter elements', () => {
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains('In progress');
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.exporterSummaryList();
    });

    it('displays the correct automatic cover elements', () => {
      applicationDetails.automaticCoverHeading();
      applicationDetails.automaticCoverStatus().contains('In progress');
      applicationDetails.automaticCoverDetailsLink();
      applicationDetails.automaticCoverCriteria().should('not.exist');
      applicationDetails.automaticCoverSummaryList().should('not.exist');
    });

    it('displays the correct submit elements', () => {
      applicationDetails.submitHeading();
      applicationDetails.submitButton().should('not.exist');
      applicationDetails.submitValidationText();
    });
  });

  describe('Visiting page when COMPLETED status', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${applications[2]._id}`));
    });

    it('displays the application banner', () => {
      applicationDetails.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.editRefNameLink().should('have.text', 'HSBC 123');
    });

    it('displays the correct exporter elements', () => {
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains('Completed');
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.exporterSummaryList();
    });

    it.only('displays the correct automatic cover elements', () => {
      applicationDetails.automaticCoverHeading();
      applicationDetails.automaticCoverStatus().contains('Complete');
      applicationDetails.automaticCoverCriteria();
      applicationDetails.automaticCoverDetailsLink().should('not.exist');
      applicationDetails.automaticCoverSummaryList();
      applicationDetails.eligibilityCriterionTwelve();
      applicationDetails.eligibilityCriterionThirteen();
      applicationDetails.eligibilityCriterionFourteen();
      applicationDetails.eligibilityCriterionFifteen();
      applicationDetails.eligibilityCriterionSixteen();
      applicationDetails.eligibilityCriterionSeventeen();
      applicationDetails.eligibilityCriterionEighteen();
      applicationDetails.eligibilityCriterionNineteen();
    });

    it('displays the correct submit elements', () => {
      applicationDetails.submitHeading();
      applicationDetails.submitButton();
      applicationDetails.submitValidationText().should('not.exist');
    });
  });

  context('Manual Inclusion Application', () => {
    before(() => {
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${applications[1]._id}`));

      // Make the deal a Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        if (index === 0) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        } else {
          $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        }
      });
      automaticCover.saveAndReturnButton().click();
    });

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
    });

    describe('Supporting information section', () => {
      it('displays the section elements', () => {
        applicationDetails.supportingInfoHeading();
        applicationDetails.supportingInfoStartLink();
        applicationDetails.supportingInfoStatus().contains('Not started');
      });

      it('takes you to first supporting info question when clicked on `Add supporting information` link', () => {
        applicationDetails.supportingInfoStartLink().click();
        cy.url().should('eq', relative(`/gef/application-details/${applications[1]._id}/supporting-information/manual-inclusion-questionnaire`));
      });
    });
  });
});
