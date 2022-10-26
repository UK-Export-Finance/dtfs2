import relative from './relativeURL';
import aboutFacility from './pages/about-facility';
import CREDENTIALS from '../fixtures/credentials.json';
import dateConstants from '../../../e2e-fixtures/dateConstants';

const applications = [];
let token;

const now = new Date();
const { yesterday } = dateConstants;

context('About Facility Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          cy.apiFetchAllFacilities(item._id, token)
            .then((res) => {
              applications.push({
                id: item._id,
                facilities: res.body.items.filter((it) => it.details.dealId === item._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('Visiting page with already issued cash facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
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
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.exist');
    });

    it('redirects user to `Has your bank already issued` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}`));
    });

    it('validates form when clicking on Continue', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary();
      aboutFacility.facilityNameError();
      aboutFacility.shouldCoverStartOnSubmissionError();
      aboutFacility.coverEndDateError();
    });

    it('redirects user to application page when clicking on `save and return` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });

    it('shows the cover start date fields when clicking on the `No` radio button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverStartDate().should('not.be.visible');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDate();
    });

    it('validates the cover start date fields when clicking on the Continue button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDate();
      aboutFacility.continueButton().click();
      aboutFacility.coverStartDateError();
    });

    it('should show an error message if coverStartDate or coverEndDate break validation rules', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
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
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDateDay().clear().type(now.getDate());
      aboutFacility.coverStartDateMonth().clear().type(now.getMonth() + 1);
      aboutFacility.coverStartDateYear().clear().type(now.getFullYear());
      aboutFacility.coverEndDateDay().clear().type(now.getDate());
      aboutFacility.coverEndDateMonth().clear().type(now.getMonth() + 1);
      aboutFacility.coverEndDateYear().clear().type(now.getFullYear());
      aboutFacility.continueButton().click();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverStartDate and coverEndDate are the same - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverEndDateDay().clear().type(now.getDate());
      aboutFacility.coverEndDateMonth().clear().type(now.getMonth() + 1);
      aboutFacility.coverEndDateYear().clear().type(now.getFullYear());
      aboutFacility.continueButton().click();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverEndDate is before the coverStartDate - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverEndDateDay().clear().type(yesterday.getDate());
      aboutFacility.coverEndDateMonth().clear().type(yesterday.getMonth() + 1);
      aboutFacility.coverEndDateYear().clear().type(yesterday.getFullYear());
      aboutFacility.continueButton().click();
      aboutFacility.coverEndDateError().contains('Cover end date cannot be before cover start date');
    });

    it('redirects the user to `provided facility` page when form has been successfully filled in', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDateDay().type(now.getDate());
      aboutFacility.coverStartDateMonth().type(now.getMonth() + 1);
      aboutFacility.coverStartDateYear().type(now.getFullYear());
      aboutFacility.coverEndDateDay().type(now.getDate());
      aboutFacility.coverEndDateMonth().type(now.getMonth());
      aboutFacility.coverEndDateYear().type(now.getFullYear() + 1);
      aboutFacility.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/provided-facility`));
    });
  });

  describe('Visiting page with unissued cash facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
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
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });

    it('doesnt validate facility name field as its optional', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
      aboutFacility.monthsOfCover().type('10');
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary().should('not.exist');
      aboutFacility.facilityNameError().should('not.exist');
    });

    it('validates `months of cover` field if not a number', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
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
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/about-facility`));
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
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.exist');
    });
  });

  describe('Visiting page with unissued contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[3].details._id}/about-facility`));
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
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });
  });
});
