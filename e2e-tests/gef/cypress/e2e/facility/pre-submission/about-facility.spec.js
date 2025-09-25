import { today, twoDays, tomorrow, yesterday } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../relativeURL';
import { backLink, continueButton, errorSummary, headingCaption, mainHeading, form, saveAndReturnButton } from '../../partials';
import aboutFacility from '../../pages/about-facility';
import bankReviewDate from '../../pages/bank-review-date';
import facilityEndDate from '../../pages/facility-end-date';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

context('About Facility Page  - feature flag enabled', () => {
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
      backLink();
      headingCaption();
      mainHeading().contains('cash');
      mainHeading().should('not.contain', 'contingent');
      form();
      aboutFacility.facilityName();
      aboutFacility.facilityNameLabel().contains('cash');
      aboutFacility.shouldCoverStartOnSubmissionYes();
      aboutFacility.shouldCoverStartOnSubmissionNo();
      aboutFacility.coverStartDate().should('not.be.visible');
      aboutFacility.coverEndDateDay();
      aboutFacility.coverEndDateMonth();
      aboutFacility.coverEndDateYear();
      aboutFacility.isUsingFacilityEndDateYes();
      aboutFacility.isUsingFacilityEndDateNo();

      continueButton();
      saveAndReturnButton();
      aboutFacility.monthsOfCover().should('not.exist');
    });

    it('redirects user to `Has your bank already issued` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}`));
    });

    it('validates form when clicking on Continue', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.clickContinueButton();
      errorSummary();
      aboutFacility.facilityNameError();
      aboutFacility.shouldCoverStartOnSubmissionError();
      aboutFacility.coverEndDateError();
      aboutFacility.isUsingFacilityEndDateError();
    });

    it('redirects user to application page when clicking on `save and return` button', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.clickSaveAndReturnButton();
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
      cy.clickContinueButton();
      aboutFacility.coverStartDateError();
    });

    it('should show an error message if coverStartDate or coverEndDate break validation rules', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', day: `${today.dayLong}-`, month: today.monthLong, year: today.year });

      cy.completeDateFormFields({ idPrefix: 'cover-end-date', day: `${today.dayLong}-`, month: today.monthLong, year: today.year });

      cy.clickContinueButton();
      errorSummary().contains('Cover start date must be a real date');
      errorSummary().contains('Cover end date must be a real date');
      aboutFacility.coverStartDateError().contains('Cover start date must be a real date');
      aboutFacility.coverEndDateError().contains('Cover end date must be a real date');

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', month: null, year: '-' });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', month: null, year: '2' });

      cy.clickContinueButton();
      errorSummary().contains('Cover start date must be a real date');
      errorSummary().contains('Cover end date must be a real date');
      aboutFacility.coverStartDateError().contains('Cover start date must be a real date');
      aboutFacility.coverEndDateError().contains('Cover end date must be a real date');
    });

    it('should show an error message if coverStartDate and coverEndDate are the same', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date' });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date' });

      cy.clickContinueButton();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverStartDate and coverEndDate are the same - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();

      cy.completeDateFormFields({ idPrefix: 'cover-end-date' });

      cy.clickContinueButton();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverEndDate is before the coverStartDate - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();

      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: yesterday.date });

      cy.clickContinueButton();
      aboutFacility.coverEndDateError().contains('Cover end date cannot be before cover start date');
    });

    it('redirects user to `facility end date` page when using facility end date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date' });

      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: twoDays.date });

      aboutFacility.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
    });

    it('wipes the facility end date value when updating the cover start date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: tomorrow.date });

      cy.clickContinueButton();

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: tomorrow.date });

      cy.clickContinueButton();

      facilityEndDate.facilityEndDateDay().should('have.value', '');
      facilityEndDate.facilityEndDateMonth().should('have.value', '');
      facilityEndDate.facilityEndDateYear().should('have.value', '');
    });

    it('redirects user to `bank review date` page when not using facility end date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date' });

      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: twoDays.date });

      aboutFacility.isUsingFacilityEndDateNo().click();

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
    });

    it('wipes the bank review date value when updating the cover start date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: tomorrow.date });

      cy.clickContinueButton();

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: tomorrow.date });

      cy.clickContinueButton();

      bankReviewDate.bankReviewDateDay().should('have.value', '');
      bankReviewDate.bankReviewDateMonth().should('have.value', '');
      bankReviewDate.bankReviewDateYear().should('have.value', '');
    });

    it('stores the inputted values when returning to the page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date' });

      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: tomorrow.date });

      aboutFacility.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();
      errorSummary().should('not.exist');

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().should('have.value', 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('be.checked');
      aboutFacility.coverStartDateDay().should('have.value', today.day); // pre-populated date uses the 'd' format
      aboutFacility.coverStartDateMonth().should('have.value', today.month); // pre-populated month uses the 'M' format
      aboutFacility.coverStartDateYear().should('have.value', today.year);
      aboutFacility.coverEndDateDay().should('have.value', tomorrow.day); // pre-populated date uses the 'd' format
      aboutFacility.coverEndDateMonth().should('have.value', tomorrow.month); // pre-populated month uses the 'M' format
      aboutFacility.coverEndDateYear().should('have.value', tomorrow.year);
      if (application.version >= 1) {
        aboutFacility.isUsingFacilityEndDateYes().should('be.checked');
        aboutFacility.isUsingFacilityEndDateNo().should('not.be.checked');
        aboutFacility.isUsingFacilityEndDateNo().click();

        cy.clickContinueButton();

        cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
        aboutFacility.isUsingFacilityEndDateNo().should('be.checked');
        aboutFacility.isUsingFacilityEndDateYes().should('not.be.checked');
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
      backLink();
      headingCaption();
      mainHeading().contains('cash');
      mainHeading().should('not.contain', 'contingent');
      form();
      aboutFacility.facilityNameLabel().contains('cash');
      aboutFacility.shouldCoverStartOnSubmissionYes().should('not.exist');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('not.exist');
      aboutFacility.coverStartDate().should('not.exist');
      aboutFacility.coverEndDateDay().should('not.exist');
      aboutFacility.coverEndDateMonth().should('not.exist');
      aboutFacility.coverEndDateYear().should('not.exist');
      aboutFacility.isUsingFacilityEndDateYes();
      aboutFacility.isUsingFacilityEndDateNo();

      continueButton();
      saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });

    it('does not validate facility name field as its optional', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.monthsOfCover(), '10');
      aboutFacility.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();
      errorSummary().should('not.exist');
      aboutFacility.facilityNameError().should('not.exist');
    });

    it('validates `months of cover` field if not a number', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.monthsOfCover(), 'ab');
      cy.clickContinueButton();
      aboutFacility.monthsOfCoverError();

      cy.keyboardInput(aboutFacility.monthsOfCover(), '-100');
      cy.clickContinueButton();
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
      backLink();
      headingCaption();
      mainHeading().contains('contingent');
      mainHeading().should('not.contain', 'cash');
      form();
      aboutFacility.facilityName();
      aboutFacility.facilityNameLabel().contains('contingent');
      aboutFacility.shouldCoverStartOnSubmissionYes();
      aboutFacility.shouldCoverStartOnSubmissionNo();
      aboutFacility.coverStartDate();
      aboutFacility.coverEndDateDay();
      aboutFacility.coverEndDateMonth();
      aboutFacility.coverEndDateYear();
      continueButton();
      aboutFacility.isUsingFacilityEndDateYes();
      aboutFacility.isUsingFacilityEndDateNo();

      saveAndReturnButton();
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
      backLink();
      headingCaption();
      mainHeading().contains('contingent');
      mainHeading().should('not.contain', 'cash');
      form();
      aboutFacility.facilityNameLabel().contains('contingent');
      aboutFacility.shouldCoverStartOnSubmissionYes().should('not.exist');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('not.exist');
      aboutFacility.coverStartDate().should('not.exist');
      aboutFacility.coverEndDateDay().should('not.exist');
      aboutFacility.coverEndDateMonth().should('not.exist');
      aboutFacility.coverEndDateYear().should('not.exist');
      continueButton();
      aboutFacility.isUsingFacilityEndDateYes();
      aboutFacility.isUsingFacilityEndDateNo();

      saveAndReturnButton();
      aboutFacility.monthsOfCover();
    });
  });
});
