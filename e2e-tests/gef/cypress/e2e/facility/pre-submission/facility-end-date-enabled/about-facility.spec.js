import relative from '../../../relativeURL';
import { backLink, continueButton, errorSummary, headingCaption, mainHeading, form, saveAndReturnButton } from '../../../partials';
import aboutFacility from '../../../pages/about-facility';
import bankReviewDate from '../../../pages/bank-review-date';
import facilityEndDate from '../../../pages/facility-end-date';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';

const applications = [];
let token;

const now = new Date();
const { yesterday } = dateConstants;

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
      cy.keyboardInput(aboutFacility.coverStartDateDay(), `${now.getDate()}-`);
      cy.keyboardInput(aboutFacility.coverStartDateMonth(), now.getMonth() + 1);
      cy.keyboardInput(aboutFacility.coverStartDateYear(), now.getFullYear());
      cy.keyboardInput(aboutFacility.coverEndDateDay(), `${now.getDate()}-`);
      cy.keyboardInput(aboutFacility.coverEndDateMonth(), now.getMonth() + 1);
      cy.keyboardInput(aboutFacility.coverEndDateYear(), now.getFullYear());
      cy.clickContinueButton();
      errorSummary().contains('The day for the cover start date must include 1 or 2 numbers');
      errorSummary().contains('The day for the cover end date must include 1 or 2 numbers');
      aboutFacility.coverStartDateError().contains('The day for the cover start date must include 1 or 2 numbers');
      aboutFacility.coverEndDateError().contains('The day for the cover end date must include 1 or 2 numbers');

      cy.keyboardInput(aboutFacility.coverStartDateDay(), now.getDate());
      cy.keyboardInput(aboutFacility.coverStartDateYear(), '-');
      cy.keyboardInput(aboutFacility.coverEndDateDay(), now.getDate());
      cy.keyboardInput(aboutFacility.coverEndDateYear(), '2');
      cy.clickContinueButton();
      errorSummary().contains('The year for the cover start date must include 4 numbers');
      errorSummary().contains('The year for the cover end date must include 4 numbers');
      aboutFacility.coverStartDateError().contains('The year for the cover start date must include 4 numbers');
      aboutFacility.coverEndDateError().contains('The year for the cover end date must include 4 numbers');
    });

    it('should show an error message if coverStartDate and coverEndDate are the same', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacility.coverStartDateDay(), now.getDate());
      cy.keyboardInput(aboutFacility.coverStartDateMonth(), now.getMonth() + 1);
      cy.keyboardInput(aboutFacility.coverStartDateYear(), now.getFullYear());
      cy.keyboardInput(aboutFacility.coverEndDateDay(), now.getDate());
      cy.keyboardInput(aboutFacility.coverEndDateMonth(), now.getMonth() + 1);
      cy.keyboardInput(aboutFacility.coverEndDateYear(), now.getFullYear());
      cy.clickContinueButton();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverStartDate and coverEndDate are the same - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      cy.keyboardInput(aboutFacility.coverEndDateDay(), now.getDate());
      cy.keyboardInput(aboutFacility.coverEndDateMonth(), now.getMonth() + 1);
      cy.keyboardInput(aboutFacility.coverEndDateYear(), now.getFullYear());
      cy.clickContinueButton();
      aboutFacility.coverEndDateError().contains('The cover end date must be after the cover start date');
    });

    it('should show an error message if coverEndDate is before the coverStartDate - shouldCoverStartOnSubmission', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      cy.keyboardInput(aboutFacility.coverEndDateDay(), yesterday.getDate());
      cy.keyboardInput(aboutFacility.coverEndDateMonth(), yesterday.getMonth() + 1);
      cy.keyboardInput(aboutFacility.coverEndDateYear(), yesterday.getFullYear());
      cy.clickContinueButton();
      aboutFacility.coverEndDateError().contains('Cover end date cannot be before cover start date');
    });

    it('redirects user to `facility end date` page when using facility end date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacility.coverStartDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacility.coverStartDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacility.coverStartDateYear(), dateConstants.todayYear);
      cy.keyboardInput(aboutFacility.coverEndDateDay(), dateConstants.twoDaysDay);
      cy.keyboardInput(aboutFacility.coverEndDateMonth(), dateConstants.twoDaysMonth);
      cy.keyboardInput(aboutFacility.coverEndDateYear(), dateConstants.twoDaysYear);
      aboutFacility.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
    });

    it('wipes the facility end date value when updating the cover start date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
      cy.keyboardInput(facilityEndDate.facilityEndDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(facilityEndDate.facilityEndDateYear(), dateConstants.tomorrowYear);

      cy.clickContinueButton();

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));

      cy.keyboardInput(aboutFacility.coverStartDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacility.coverStartDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacility.coverStartDateYear(), dateConstants.tomorrowYear);

      cy.clickContinueButton();

      facilityEndDate.facilityEndDateDay().should('have.value', '');
      facilityEndDate.facilityEndDateMonth().should('have.value', '');
      facilityEndDate.facilityEndDateYear().should('have.value', '');
    });

    it('redirects user to `bank review date` page when not using facility end date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacility.coverStartDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacility.coverStartDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacility.coverStartDateYear(), dateConstants.todayYear);
      cy.keyboardInput(aboutFacility.coverEndDateDay(), dateConstants.twoDaysDay);
      cy.keyboardInput(aboutFacility.coverEndDateMonth(), dateConstants.twoDaysMonth);
      cy.keyboardInput(aboutFacility.coverEndDateYear(), dateConstants.twoDaysYear);
      aboutFacility.isUsingFacilityEndDateNo().click();

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
    });

    it('wipes the bank review date value when updating the cover start date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      cy.fillInBankReviewDate(dateConstants.tomorrow);

      cy.clickContinueButton();

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));

      cy.keyboardInput(aboutFacility.coverStartDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacility.coverStartDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacility.coverStartDateYear(), dateConstants.tomorrowYear);

      cy.clickContinueButton();

      bankReviewDate.bankReviewDateDay().should('have.value', '');
      bankReviewDate.bankReviewDateMonth().should('have.value', '');
      bankReviewDate.bankReviewDateYear().should('have.value', '');
    });

    it('stores the inputted values when returning to the page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      cy.keyboardInput(aboutFacility.facilityName(), 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacility.coverStartDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacility.coverStartDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacility.coverStartDateYear(), dateConstants.todayYear);
      cy.keyboardInput(aboutFacility.coverEndDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacility.coverEndDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacility.coverEndDateYear(), dateConstants.tomorrowYear);
      aboutFacility.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();
      errorSummary().should('not.exist');

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().should('have.value', 'Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().should('be.checked');
      aboutFacility.coverStartDateDay().should('have.value', dateConstants.today.getDate().toString()); // pre-populated date uses the 'd' format (not 'dd' like 'todayDay')
      aboutFacility.coverStartDateMonth().should('have.value', dateConstants.today.getMonth() + 1); // pre-populated month uses the 'M' format (not 'MM' like 'todayMonth')
      aboutFacility.coverStartDateYear().should('have.value', dateConstants.todayYear);
      aboutFacility.coverEndDateDay().should('have.value', dateConstants.tomorrow.getDate().toString()); // pre-populated date uses the 'd' format (not 'dd' like 'tomorrowDay')
      aboutFacility.coverEndDateMonth().should('have.value', dateConstants.tomorrow.getMonth() + 1); // pre-populated month uses the 'M' format (not 'MM' like 'tomorrowMonth')
      aboutFacility.coverEndDateYear().should('have.value', dateConstants.tomorrowYear);
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
