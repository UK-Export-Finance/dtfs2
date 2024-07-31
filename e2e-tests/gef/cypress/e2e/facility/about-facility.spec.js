import relative from '../relativeURL';
import aboutFacility from '../pages/about-facility';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import dateConstants from '../../../../e2e-fixtures/dateConstants';

const applications = [];
let token;

const now = new Date();
const { yesterday } = dateConstants;

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

context('About Facility Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllGefApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          cy.apiFetchAllFacilities(item._id, token).then((res) => {
            applications.push({
              id: item._id,
              facilities: res.body.items.filter((it) => it.details.dealId === item._id),
            });
          });
        });
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('Visiting page with already issued cash facility', () => {
    let application;
    let facilityId;

    before(() => {
      application = applications[1];
      facilityId = application.facilities[0].details._id;
    });

    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.backLink();
      aboutFacility.headingCaption();
      aboutFacility.mainHeading().contains('cash');
      aboutFacility.mainHeading().should('not.contain', 'contingent');
      aboutFacility.form();
      aboutFacility.facilityName();
      aboutFacility.facilityNameLabel().contains('cash');
      aboutFacility.shouldCoverStartOnSubmissionYes();
      aboutFacility.shouldCoverStartOnSubmissionNo();
      aboutFacility.coverStartDate().should('not.be.visible');
      aboutFacility.coverEndDateDay();
      aboutFacility.coverEndDateMonth();
      aboutFacility.coverEndDateYear();
      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateYes();
        aboutFacility.isUsingFacilityEndDateNo();
      } else {
        aboutFacility.isUsingFacilityEndDateYes().should('not.exist');
        aboutFacility.isUsingFacilityEndDateNo().should('not.exist');
      }
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.exist');
    });

    it('redirects user to `Has your bank already issued` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}`));
    });

    it('validates form when clicking on Continue', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary();
      aboutFacility.facilityNameError();
      aboutFacility.shouldCoverStartOnSubmissionError();
      aboutFacility.coverEndDateError();
      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateError();
      }
    });

    it('redirects user to application page when clicking on `save and return` button', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}`));
    });

    it('shows the cover start date fields when clicking on the `No` radio button', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverStartDate().should('not.be.visible');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDate();
    });

    it('validates the cover start date fields when clicking on the Continue button', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDate();
      aboutFacility.continueButton().click();
      aboutFacility.coverStartDateError();
    });

    it('should show an error message if coverStartDate or coverEndDate break validation rules', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDateDay().type(`${now.getDate()}-`);
      aboutFacility.coverStartDateMonth().type(now.getMonth() + 1);
      aboutFacility.coverStartDateYear().type(now.getFullYear());
      aboutFacility.coverEndDateDay().type(`${now.getDate()}-`);
      aboutFacility.coverEndDateMonth().type(now.getMonth() + 1);
      aboutFacility.coverEndDateYear().type(now.getFullYear());
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary().contains('The day for the cover start date must include 1 or 2 numbers');
      aboutFacility.errorSummary().contains('The day for the cover end date must include 1 or 2 numbers');
      aboutFacility.coverStartDateError().contains('The day for the cover start date must include 1 or 2 numbers');
      aboutFacility.coverEndDateError().contains('The day for the cover end date must include 1 or 2 numbers');

      aboutFacility.coverStartDateDay().clear().type(now.getDate());
      aboutFacility.coverStartDateYear().type('-');
      aboutFacility.coverEndDateDay().clear().type(now.getDate());
      aboutFacility.coverEndDateYear().type('2');
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary().contains('The year for the cover start date must include 4 numbers');
      aboutFacility.errorSummary().contains('The year for the cover end date must include 4 numbers');
      aboutFacility.coverStartDateError().contains('The year for the cover start date must include 4 numbers');
      aboutFacility.coverEndDateError().contains('The year for the cover end date must include 4 numbers');
    });

    it('should show an error message if coverStartDate and coverEndDate are the same', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDateDay().clear().type(now.getDate());
      aboutFacility
        .coverStartDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      aboutFacility.coverStartDateYear().clear().type(now.getFullYear());
      aboutFacility.coverEndDateDay().clear().type(now.getDate());
      aboutFacility
        .coverEndDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      aboutFacility.coverEndDateYear().clear().type(now.getFullYear());
      aboutFacility.continueButton().click();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverStartDate and coverEndDate are the same - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverEndDateDay().clear().type(now.getDate());
      aboutFacility
        .coverEndDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      aboutFacility.coverEndDateYear().clear().type(now.getFullYear());
      aboutFacility.continueButton().click();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverEndDate is before the coverStartDate - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverEndDateDay().clear().type(yesterday.getDate());
      aboutFacility
        .coverEndDateMonth()
        .clear()
        .type(yesterday.getMonth() + 1);
      aboutFacility.coverEndDateYear().clear().type(yesterday.getFullYear());
      aboutFacility.continueButton().click();
      aboutFacility.coverEndDateError().contains('Cover end date cannot be before cover start date');
    });

    if (facilityEndDateEnabled) {
      it('redirects user to `bank review date` page when not using facility end date', () => {
        cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
        aboutFacility.facilityName().clear().type('Name');
        aboutFacility.shouldCoverStartOnSubmissionNo().click();
        aboutFacility.coverStartDateDay().clear().type(now.getDate());
        aboutFacility
          .coverStartDateMonth()
          .clear()
          .type(now.getMonth() + 1);
        aboutFacility.coverStartDateYear().clear().type(now.getFullYear());
        aboutFacility.coverEndDateDay().clear().type(now.getDate());
        aboutFacility
          .coverEndDateMonth()
          .clear()
          .type(now.getMonth() + 1);
        aboutFacility
          .coverEndDateYear()
          .clear()
          .type(now.getFullYear() + 1);
        aboutFacility.isUsingFacilityEndDateNo().click();

        aboutFacility.continueButton().click();

        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      });
    } else {
      it('redirects the user to `provided facility` page', () => {
        cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
        aboutFacility.facilityName().clear().type('Name');
        aboutFacility.shouldCoverStartOnSubmissionNo().click();
        aboutFacility.coverStartDateDay().clear().type(now.getDate());
        aboutFacility
          .coverStartDateMonth()
          .clear()
          .type(now.getMonth() + 1);
        aboutFacility.coverStartDateYear().clear().type(now.getFullYear());
        aboutFacility.coverEndDateDay().clear().type(now.getDate());
        aboutFacility
          .coverEndDateMonth()
          .clear()
          .type(now.getMonth() + 1);
        aboutFacility
          .coverEndDateYear()
          .clear()
          .type(now.getFullYear() + 1);

        aboutFacility.continueButton().click();

        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
      });
    }

    it('stores the inputted values when returning to the page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().clear().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDateDay().clear().type(now.getDate());
      aboutFacility
        .coverStartDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      aboutFacility.coverStartDateYear().clear().type(now.getFullYear());
      aboutFacility.coverEndDateDay().clear().type(now.getDate());
      aboutFacility
        .coverEndDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      aboutFacility
        .coverEndDateYear()
        .clear()
        .type(now.getFullYear() + 1);
      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateYes().click();
      }
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary().should('not.exist');

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().should('have.value', 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('be.checked');
      aboutFacility.coverStartDateDay().should('have.value', now.getDate());
      aboutFacility.coverStartDateMonth().should('have.value', now.getMonth() + 1);
      aboutFacility.coverStartDateYear().should('have.value', now.getFullYear());
      aboutFacility.coverEndDateDay().should('have.value', now.getDate());
      aboutFacility.coverEndDateMonth().should('have.value', now.getMonth() + 1);
      aboutFacility.coverEndDateYear().should('have.value', now.getFullYear() + 1);

      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateYes().should('be.checked');
        aboutFacility.isUsingFacilityEndDateNo().should('be.not.checked');
        aboutFacility.isUsingFacilityEndDateNo().click();

        aboutFacility.continueButton().click();

        cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
        aboutFacility.isUsingFacilityEndDateNo().should('be.checked');
        aboutFacility.isUsingFacilityEndDateYes().should('be.not.checked');
      }
    });
  });

  describe('Visiting page with unissued cash facility', () => {
    let application;
    let facilityId;

    before(() => {
      application = applications[1];
      facilityId = application.facilities[1].details._id;
    });

    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.backLink();
      aboutFacility.headingCaption();
      aboutFacility.mainHeading().contains('cash');
      aboutFacility.mainHeading().should('not.contain', 'contingent');
      aboutFacility.form();
      aboutFacility.facilityNameLabel().contains('cash');
      aboutFacility.shouldCoverStartOnSubmissionYes().should('not.exist');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('not.exist');
      aboutFacility.coverStartDate().should('not.exist');
      aboutFacility.coverEndDateDay().should('not.exist');
      aboutFacility.coverEndDateMonth().should('not.exist');
      aboutFacility.coverEndDateYear().should('not.exist');
      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateYes();
        aboutFacility.isUsingFacilityEndDateNo();
      } else {
        aboutFacility.isUsingFacilityEndDateYes().should('not.exist');
        aboutFacility.isUsingFacilityEndDateNo().should('not.exist');
      }
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });

    it('does not validate facility name field as its optional', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.monthsOfCover().type('10');
      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateYes().click();
      }
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary().should('not.exist');
      aboutFacility.facilityNameError().should('not.exist');
    });

    it('validates `months of cover` field if not a number', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.monthsOfCover().clear();
      aboutFacility.monthsOfCover().type('ab');
      aboutFacility.continueButton().click();
      aboutFacility.monthsOfCoverError();

      aboutFacility.monthsOfCover().clear();
      aboutFacility.monthsOfCover().type('-100');
      aboutFacility.continueButton().click();
      aboutFacility.monthsOfCoverError();
    });
  });

  describe('Visiting page with already issued contingent facility', () => {
    let application;
    let facilityId;

    before(() => {
      application = applications[2];
      facilityId = application.facilities[2].details._id;
    });

    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.backLink();
      aboutFacility.headingCaption();
      aboutFacility.mainHeading().contains('contingent');
      aboutFacility.mainHeading().should('not.contain', 'cash');
      aboutFacility.form();
      aboutFacility.facilityName();
      aboutFacility.facilityNameLabel().contains('contingent');
      aboutFacility.shouldCoverStartOnSubmissionYes();
      aboutFacility.shouldCoverStartOnSubmissionNo();
      aboutFacility.coverStartDate();
      aboutFacility.coverEndDateDay();
      aboutFacility.coverEndDateMonth();
      aboutFacility.coverEndDateYear();
      aboutFacility.continueButton();
      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateYes();
        aboutFacility.isUsingFacilityEndDateNo();
      } else {
        aboutFacility.isUsingFacilityEndDateYes().should('not.exist');
        aboutFacility.isUsingFacilityEndDateNo().should('not.exist');
      }
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.exist');
    });
  });

  describe('Visiting page with unissued contingent facility', () => {
    let application;
    let facilityId;

    before(() => {
      application = applications[2];
      facilityId = application.facilities[3].details._id;
    });

    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.backLink();
      aboutFacility.headingCaption();
      aboutFacility.mainHeading().contains('contingent');
      aboutFacility.mainHeading().should('not.contain', 'cash');
      aboutFacility.form();
      aboutFacility.facilityNameLabel().contains('contingent');
      aboutFacility.shouldCoverStartOnSubmissionYes().should('not.exist');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('not.exist');
      aboutFacility.coverStartDate().should('not.exist');
      aboutFacility.coverEndDateDay().should('not.exist');
      aboutFacility.coverEndDateMonth().should('not.exist');
      aboutFacility.coverEndDateYear().should('not.exist');
      aboutFacility.continueButton();
      if (facilityEndDateEnabled) {
        aboutFacility.isUsingFacilityEndDateYes();
        aboutFacility.isUsingFacilityEndDateNo();
      } else {
        aboutFacility.isUsingFacilityEndDateYes().should('not.exist');
        aboutFacility.isUsingFacilityEndDateNo().should('not.exist');
      }
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });
  });
});
