import relative from '../../relativeURL';
import { backLink, headingCaption, continueButton, saveAndReturnButton, errorSummary } from '../../partials';
import bankReviewDate from '../../pages/bank-review-date';
import aboutFacility from '../../pages/about-facility';
import { today, twoYears, tomorrow, yesterday, sixYearsOneDay } from '../../../../../e2e-fixtures/dateConstants';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

const nextYear = Number(today.year) + 1;

context('Bank Review Date Page', () => {
  let application;
  let facilityId;

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
    application = applications[1];
    facilityId = application.facilities[0].details._id;

    cy.saveSession();
  });

  it('displays the correct elements', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));

    aboutFacility.isUsingFacilityEndDateNo().click();
    cy.clickSaveAndReturnButton();

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    backLink();
    headingCaption();
    bankReviewDate.bankReviewDateDay();
    bankReviewDate.bankReviewDateMonth();
    bankReviewDate.bankReviewDateYear();
    bankReviewDate.bankReviewDateDetails();
    continueButton();
    saveAndReturnButton();
  });

  it('redirects the user to `About this facility` page when clicking on back link', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.clickBackLink();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
  });

  it('validates the form when clicking on Continue', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.clickContinueButton();
    errorSummary();
    bankReviewDate.bankReviewDateError();
  });

  it('redirects user to application page when clicking on `save and return` button', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
    cy.clickSaveAndReturnButton();
    cy.url().should('eq', relative(`/gef/application-details/${application.id}`));
  });

  it('validates the form if not blank when clicking on `save and return` button', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', month: null, year: null });

    bankReviewDate.bankReviewDateMonth().clear();
    cy.clickSaveAndReturnButton();
    errorSummary();
    bankReviewDate.bankReviewDateError();
  });

  it('redirects user to application page when clicking on `save and return` button and form has been successfully filled in', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: twoYears.date });

    cy.clickSaveAndReturnButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}`));
  });

  it('when cover start date is given, it validates bank review date is after the cover start date', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    cy.keyboardInput(aboutFacility.facilityName(), 'Name');
    aboutFacility.shouldCoverStartOnSubmissionNo().click();

    cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: tomorrow.date });
    cy.completeDateFormFields({ idPrefix: 'cover-end-date', year: nextYear });

    aboutFacility.isUsingFacilityEndDateNo().click();

    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: today.date });

    cy.clickContinueButton();
    errorSummary();
    bankReviewDate.bankReviewDateError();

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: tomorrow.date });

    cy.clickContinueButton();
    errorSummary().should('not.exist');
  });

  it('when cover start date is not given, it validates bank review date is after today', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    cy.keyboardInput(aboutFacility.facilityName(), 'Name');
    aboutFacility.shouldCoverStartOnSubmissionYes().click();

    cy.completeDateFormFields({ idPrefix: 'cover-end-date', year: nextYear });

    aboutFacility.isUsingFacilityEndDateNo().click();

    cy.clickContinueButton();
    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: yesterday.date });

    cy.clickContinueButton();
    errorSummary();
    bankReviewDate.bankReviewDateError();

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: today.date });

    cy.clickContinueButton();
    errorSummary().should('not.exist');
  });

  it('validates bank review date is less than 6 years in the future', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: sixYearsOneDay.date });

    cy.clickContinueButton();
    errorSummary();
    bankReviewDate.bankReviewDateError();
  });

  it('redirects the user to `provided facility` page when form has been successfully filled in', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: twoYears.date });

    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
  });

  it('stores the inputted values', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: twoYears.date });

    cy.clickContinueButton();

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
    bankReviewDate.bankReviewDateDay().should('have.value', twoYears.day);
    bankReviewDate.bankReviewDateMonth().should('have.value', twoYears.month);
    bankReviewDate.bankReviewDateYear().should('have.value', twoYears.year);
  });

  it('redirects to the About Facility page when using facility end date ', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    cy.keyboardInput(aboutFacility.facilityName(), 'Name');
    aboutFacility.shouldCoverStartOnSubmissionYes().click();

    cy.completeDateFormFields({ idPrefix: 'cover-end-date', year: nextYear });

    aboutFacility.isUsingFacilityEndDateYes().click();
    cy.clickContinueButton();

    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
  });
});
