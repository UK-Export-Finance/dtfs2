/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import aboutFacility from './pages/about-facility';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

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
                facilities: res.body.items.filter((it) => it.details.applicationId === item._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    console.log(applications);
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
      aboutFacility.coverStartDate().should('not.be', 'visible');
      aboutFacility.coverEndDateDay();
      aboutFacility.coverEndDateMonth();
      aboutFacility.coverEndDateYear();
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.be', 'visible');
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
      aboutFacility.coverStartDate().should('not.be', 'visible');
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

    it('redirects the user to `provided facility` page when form has been successfully filled in', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[0].details._id}/about-facility`));
      aboutFacility.facilityName().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDateDay().type('10');
      aboutFacility.coverStartDateMonth().type('10');
      aboutFacility.coverStartDateYear().type('2022');
      aboutFacility.coverEndDateDay().type('12');
      aboutFacility.coverEndDateMonth().type('12');
      aboutFacility.coverEndDateYear().type('2024');
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
      aboutFacility.shouldCoverStartOnSubmissionYes().should('not.be', 'visible');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('not.be', 'visible');
      aboutFacility.coverStartDate().should('not.be', 'visible');
      aboutFacility.coverEndDateDay().should('not.be', 'visible');
      aboutFacility.coverEndDateMonth().should('not.be', 'visible');
      aboutFacility.coverEndDateYear().should('not.be', 'visible');
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });

    it('doesnt validate facility name field as its optional', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
      aboutFacility.monthsOfCover().type('10');
      aboutFacility.continueButton().click();
      aboutFacility.errorSummary().should('not.be', 'visible');
      aboutFacility.facilityNameError().should('not.be', 'visible');
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
      aboutFacility.coverStartDate().should('not.be', 'visible');
      aboutFacility.coverEndDateDay();
      aboutFacility.coverEndDateMonth();
      aboutFacility.coverEndDateYear();
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.be', 'visible');
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
      aboutFacility.shouldCoverStartOnSubmissionYes().should('not.be', 'visible');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('not.be', 'visible');
      aboutFacility.coverStartDate().should('not.be', 'visible');
      aboutFacility.coverEndDateDay().should('not.be', 'visible');
      aboutFacility.coverEndDateMonth().should('not.be', 'visible');
      aboutFacility.coverEndDateYear().should('not.be', 'visible');
      aboutFacility.continueButton();
      aboutFacility.saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });
  });
});
