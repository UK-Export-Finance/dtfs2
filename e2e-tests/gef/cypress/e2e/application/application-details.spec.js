import relative from '../relativeURL';
import { headingCaption, mainHeading, saveAndReturnButton, submitButton } from '../partials';
import applicationDetails from '../pages/application-details';
import automaticCover from '../pages/automatic-cover';
import facilities from '../pages/facilities';
import statusBanner from '../pages/application-status-banner';
import { BANK1_MAKER1, ADMIN, READ_ONLY_ALL_BANKS } from '../../../../e2e-fixtures/portal-users.fixture';
import CONSTANTS from '../../fixtures/constants';

const { todayFormattedShort } = require('../../../../e2e-fixtures/dateConstants');

let dealWithEmptyExporter;
let dealWithEmptyExporterName;
let dealWithInProgressExporter;
let dealWithCompletedExporterAndFacilities;

context('Application Details Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealWithEmptyExporter = body.items.find((deal) => deal.exporter.status === 'Not started');

        dealWithEmptyExporterName = body.items.find((deal) => deal.exporter.status === 'Not started').bankInternalRefName;

        dealWithInProgressExporter = body.items.find((deal) => deal.exporter.status === 'In progress');

        dealWithCompletedExporterAndFacilities = body.items.find((deal) => deal.exporter.status === 'Completed' && deal.facilitiesUpdated);
      });

    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('Visiting page for the first time - NOT STARTED', () => {
    beforeEach(() => {
      cy.visit(relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
    });

    it('displays the application banner', () => {
      statusBanner.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.editRefNameLink().should('have.text', 'UKEF Test 123');

      statusBanner.bannerStatus().contains('Draft');
      statusBanner.bannerProduct().should('have.text', 'General Export Facility');

      statusBanner.bannerDateCreated().contains(todayFormattedShort);
      statusBanner.bannerSubmissionType().should('have.text', '-');
      statusBanner.bannerCreatedBy().should('have.text', `${dealWithEmptyExporter.maker.firstname} ${dealWithEmptyExporter.maker.surname}`);
      statusBanner.bannerExporter().should('have.text', '-');
      statusBanner.bannerCheckedBy().should('have.text', '-');
      statusBanner.bannerBuyer().should('have.text', '-');
    });

    it('displays the correct headings', () => {
      applicationDetails.applicationDetailsPage();
      headingCaption();
      mainHeading()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Application Details');
        });
    });

    it('shows an abandon button with correct aria-label', () => {
      applicationDetails.abandonLink().contains('Abandon');
      applicationDetails
        .abandonLink()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(`Abandon deal ${dealWithEmptyExporterName}`);
        });
    });

    it('shows a valid link to edit the reference', () => {
      applicationDetails.editRefNameLink().click();
      cy.url().should('eq', relative(`/gef/applications/${dealWithEmptyExporter._id}/name`));
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
      applicationDetails.facilityGuidance();
      applicationDetails.facilityGuidance().contains('Guidance on cash and contingent facilities');
      applicationDetails.facilityGuidance().contains('Cash facilities');
      applicationDetails.facilityGuidance().contains('Contingent facilities');
      applicationDetails.facilityGuidance().contains('How many you can add');
      applicationDetails.facilitySummaryList().should('not.exist');
    });

    it('displays the correct submit elements', () => {
      applicationDetails.submitHeading();
      submitButton().should('not.exist');
      applicationDetails.submitValidationText();
    });

    it('takes you to companies house page when clicking on `Enter details`', () => {
      applicationDetails.exporterDetailsLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}/companies-house`));
    });

    it('keeps you on the same page for now when clicking on `Abandon` link', () => {
      applicationDetails.abandonLink().click();
      cy.visit(relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
    });

    it('takes you to Cash facility page when clicking on `Add a cash facility` button', () => {
      applicationDetails.addCashFacilityButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}/facilities`));
      facilities.hasBeenIssuedHeading().contains('cash');
    });

    it('takes you to Contingent facility page when clicking on `Add a contingent facility` button', () => {
      applicationDetails.addContingentFacilityButton().click();
      cy.visit(relative(`/gef/application-details/${dealWithEmptyExporter._id}/facilities?facilityType=${CONSTANTS.FACILITY_TYPE.CONTINGENT}`));
    });
  });

  describe('Visiting page when IN PROGRESS status', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealWithInProgressExporter._id}`));

      // Start the Eligibility Criteria selection, but don't complete it.
      // This puts the Eligibility Criteria section in an "in progress" state.
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.trueRadioButton(12).click();
      saveAndReturnButton().click();
    });

    beforeEach(() => {
      cy.visit(relative(`/gef/application-details/${dealWithInProgressExporter._id}`));
    });

    it('displays the application banner', () => {
      statusBanner.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.editRefNameLink().should('have.text', 'UKEF Test 123');

      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.DRAFT);
      statusBanner.bannerExporter().contains(dealWithInProgressExporter.exporter.companyName);
    });

    it('displays the correct submission type heading', () => {
      mainHeading()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Application Details');
        });
    });

    it('displays the correct exporter elements', () => {
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains(CONSTANTS.DEAL_STATUS.IN_PROGRESS);
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.exporterSummaryList();
    });

    it('displays the correct automatic cover elements', () => {
      applicationDetails.automaticCoverHeading();
      applicationDetails.automaticCoverStatus().contains(CONSTANTS.DEAL_STATUS.IN_PROGRESS);
      applicationDetails.automaticCoverDetailsLink();
      applicationDetails.automaticCoverCriteria().should('not.exist');
      applicationDetails.automaticCoverSummaryList().should('not.exist');
    });

    it('displays the facility guidance', () => {
      applicationDetails.facilityGuidance();
      applicationDetails.facilityGuidance().contains('Guidance on cash and contingent facilities');
      applicationDetails.facilityGuidance().contains('Cash facilities');
      applicationDetails.facilityGuidance().contains('Contingent facilities');
      applicationDetails.facilityGuidance().contains('How many you can add');
    });

    it('displays the correct submit elements', () => {
      applicationDetails.submitHeading();
      submitButton().should('not.exist');
      applicationDetails.submitValidationText();
    });
  });

  describe('Visiting page when COMPLETED status', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealWithCompletedExporterAndFacilities._id}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      cy.automaticEligibilityCriteria();
      saveAndReturnButton().click();
    });

    beforeEach(() => {
      cy.visit(relative(`/gef/application-details/${dealWithCompletedExporterAndFacilities._id}`));
    });

    it('displays the application banner', () => {
      statusBanner.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.editRefNameLink().should('have.text', 'HSBC 123');

      statusBanner.bannerStatus().contains('Draft');
      statusBanner.bannerSubmissionType().should('have.text', CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      statusBanner.bannerExporter().contains(dealWithCompletedExporterAndFacilities.exporter.companyName);
    });

    it('displays the correct submission type heading', () => {
      mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
    });

    it('displays the correct exporter elements', () => {
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains(CONSTANTS.DEAL_STATUS.COMPLETED);
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.exporterSummaryList();
    });

    it('displays the correct automatic cover elements', () => {
      applicationDetails.automaticCoverHeading();
      applicationDetails.automaticCoverStatus().contains(CONSTANTS.DEAL_STATUS.COMPLETED);
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

    it('displays the facility guidance', () => {
      applicationDetails.facilityGuidance();
      applicationDetails.facilityGuidance().contains('Guidance on cash and contingent facilities');
      applicationDetails.facilityGuidance().contains('Cash facilities');
      applicationDetails.facilityGuidance().contains('Contingent facilities');
      applicationDetails.facilityGuidance().contains('How many you can add');
    });

    it('displays the correct submit elements', () => {
      applicationDetails.submitHeading();
      submitButton();
      applicationDetails.submitValidationText().should('not.exist');
    });
  });

  context('Manual Inclusion Application', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealWithInProgressExporter._id}`));

      // Make the deal a Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      cy.manualEligibilityCriteria();
      saveAndReturnButton().click();
    });

    beforeEach(() => {
      cy.visit(relative(`/gef/application-details/${dealWithInProgressExporter._id}`));
    });

    it('displays the correct submission type heading and text in banner', () => {
      mainHeading().contains('Manual Inclusion Application');

      statusBanner.bannerSubmissionType().should('have.text', CONSTANTS.DEAL_SUBMISSION_TYPE.MIA);
    });

    describe('Supporting information section', () => {
      it('displays the section elements', () => {
        applicationDetails.supportingInfoHeading();
        applicationDetails.supportingInfoStartLink();
        applicationDetails.supportingInfoStatus().contains(CONSTANTS.DEAL_STATUS.NOT_STARTED);
      });

      it('takes you to first supporting info question when clicked on `Add supporting information` link', () => {
        applicationDetails.supportingInfoStartLink().click();
        cy.url().should(
          'eq',
          relative(`/gef/application-details/${dealWithInProgressExporter._id}/supporting-information/document/manual-inclusion-questionnaire`),
        );
      });
    });
  });

  describe('Restrict which users can access page', () => {
    const authorisedRoles = [
      {
        roleName: 'admins',
        userWithRole: ADMIN,
      },
      {
        roleName: 'Read only users with access to all banks',
        userWithRole: READ_ONLY_ALL_BANKS,
      },
    ];

    authorisedRoles.forEach(({ roleName, userWithRole }) => {
      it(`allows ${roleName} to access the gef deals page`, () => {
        cy.login(userWithRole);
        cy.visit(relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
        cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
      });
    });
  });
});
