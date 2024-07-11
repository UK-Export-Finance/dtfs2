import relative from '../relativeURL';
import bankReviewDate from '../pages/bank-review-date';
import aboutFacility from '../pages/about-facility';

import {
  tomorrowDay,
  tomorrowMonth,
  tomorrowYear,
  twoDaysDay,
  twoDaysMonth,
  twoDaysYear,
  yesterdayDay,
  yesterdayMonth,
  yesterdayYear,
} from '../../../../e2e-fixtures/dateConstants';

import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

const now = new Date();

context('Bank Review Date Page', () => {
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
  describe('', () => {
    let application;
    let facilityId;

    before(() => {
      application = applications[1];
      facilityId = application.facilities[0].details._id;
    });

    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.backLink();
      bankReviewDate.headingCaption();
      bankReviewDate.bankReviewDateDay();
      bankReviewDate.bankReviewDateMonth();
      bankReviewDate.bankReviewDateYear();
      bankReviewDate.bankReviewDateDetails();
      bankReviewDate.continueButton();
      bankReviewDate.saveAndReturnButton();
    });

    it('redirects the user to `About this facility` page when clicking on back link', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.backLink().click();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    });

    it('validates form when clicking on Continue', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.continueButton().click();
      bankReviewDate.errorSummary();
      bankReviewDate.bankReviewDateError();
    });

    it('when cover start date is given, it validates bank review date is after the cover start date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().clear().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionNo().click();
      aboutFacility.coverStartDateDay().clear().type(tomorrowDay);
      aboutFacility.coverStartDateMonth().clear().type(tomorrowMonth);
      aboutFacility.coverStartDateYear().clear().type(tomorrowYear);
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

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.bankReviewDateDay().clear().type(now.getDate());
      bankReviewDate
        .bankReviewDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      bankReviewDate.bankReviewDateYear().clear().type(now.getFullYear());

      bankReviewDate.continueButton().click();
      bankReviewDate.errorSummary();
      bankReviewDate.bankReviewDateError();

      bankReviewDate.bankReviewDateDay().clear().type(twoDaysDay);
      bankReviewDate.bankReviewDateMonth().clear().type(twoDaysMonth);
      bankReviewDate.bankReviewDateYear().clear().type(twoDaysYear);

      bankReviewDate.continueButton().click();
      bankReviewDate.errorSummary().should('not.exist');
    });

    it('when cover start date is not given, it validates bank review date is after today', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().clear().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
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

      bankReviewDate.bankReviewDateDay().clear().type(yesterdayDay);
      bankReviewDate.bankReviewDateMonth().clear().type(yesterdayMonth);
      bankReviewDate.bankReviewDateYear().clear().type(yesterdayYear);

      bankReviewDate.continueButton().click();
      bankReviewDate.errorSummary();
      bankReviewDate.bankReviewDateError();

      bankReviewDate.bankReviewDateDay().clear().type(now.getDate());
      bankReviewDate
        .bankReviewDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      bankReviewDate.bankReviewDateYear().clear().type(now.getFullYear());

      bankReviewDate.continueButton().click();
      bankReviewDate.errorSummary().should('not.exist');
    });

    it('validates bank review date is less than 6 years in the future', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate
        .bankReviewDateDay()
        .clear()
        .type(now.getDate() + 1);
      bankReviewDate
        .bankReviewDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      bankReviewDate
        .bankReviewDateYear()
        .clear()
        .type(now.getFullYear() + 7);

      bankReviewDate.continueButton().click();
      bankReviewDate.errorSummary();
      bankReviewDate.bankReviewDateError();
    });

    it('redirects the user to `provided facility` page when form has been successfully filled in', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.bankReviewDateDay().clear().type(now.getDate());
      bankReviewDate
        .bankReviewDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      bankReviewDate
        .bankReviewDateYear()
        .clear()
        .type(now.getFullYear() + 1);

      bankReviewDate.continueButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
    });

    it('stores the inputted values', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.bankReviewDateDay().clear().type(now.getDate());
      bankReviewDate
        .bankReviewDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      bankReviewDate
        .bankReviewDateYear()
        .clear()
        .type(now.getFullYear() + 1);

      bankReviewDate.continueButton().click();

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      bankReviewDate.bankReviewDateDay().should('have.value', now.getDate());
      bankReviewDate.bankReviewDateMonth().should('have.value', now.getMonth() + 1);
      bankReviewDate.bankReviewDateYear().should('have.value', now.getFullYear() + 1);
    });

    it('redirects to the Application Details page when using facility end date ', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().clear().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverEndDateDay().clear().type(now.getDate());
      aboutFacility
        .coverEndDateMonth()
        .clear()
        .type(now.getMonth() + 1);
      aboutFacility
        .coverEndDateYear()
        .clear()
        .type(now.getFullYear() + 1);
      aboutFacility.isUsingFacilityEndDateYes().click();
      aboutFacility.continueButton().click();

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      cy.url().should('eq', relative(`/gef/application-details/${application._id}`));
    });
  });
});
