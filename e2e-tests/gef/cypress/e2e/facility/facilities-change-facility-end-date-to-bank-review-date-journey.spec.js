import relative from '../relativeURL';
import aboutFacility from '../pages/about-facility';
import bankReviewDate from '../pages/bank-review-date';
import facilityEndDate from '../pages/facility-end-date';
import { tomorrowDay, tomorrowMonth, tomorrowYear, todayDay, todayMonth, todayYear } from '../../../../e2e-fixtures/dateConstants';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

const nextYear = Number(todayYear) + 1;

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

context('Changing between facility end date and bank review date', () => {
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

  if (facilityEndDateEnabled) {
    it('should wipe the values when changing between facility end date and bank review date', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.facilityName().clear().type('Name');
      aboutFacility.shouldCoverStartOnSubmissionYes().click();
      aboutFacility.coverEndDateDay().clear().type(todayDay);
      aboutFacility.coverEndDateMonth().clear().type(todayMonth);
      aboutFacility.coverEndDateYear().clear().type(nextYear);
      aboutFacility.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      bankReviewDate.bankReviewDateDay().clear().type(tomorrowDay);
      bankReviewDate.bankReviewDateMonth().clear().type(tomorrowMonth);
      bankReviewDate.bankReviewDateYear().clear().type(tomorrowYear);
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
      cy.clickBackLink();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      cy.clickBackLink();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.isUsingFacilityEndDateYes().click();
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
      facilityEndDate.facilityEndDateDay().clear().type(tomorrowDay);
      facilityEndDate.facilityEndDateMonth().clear().type(tomorrowMonth);
      facilityEndDate.facilityEndDateYear().clear().type(tomorrowYear);
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
      cy.clickBackLink();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
      cy.clickBackLink();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      bankReviewDate.bankReviewDateDay().should('have.value', '');
      bankReviewDate.bankReviewDateMonth().should('have.value', '');
      bankReviewDate.bankReviewDateYear().should('have.value', '');

      bankReviewDate.bankReviewDateDay().type(tomorrowDay);
      bankReviewDate.bankReviewDateMonth().type(tomorrowMonth);
      bankReviewDate.bankReviewDateYear().type(tomorrowYear);
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
      cy.clickBackLink();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      cy.clickBackLink();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
      aboutFacility.isUsingFacilityEndDateYes().click();
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
      facilityEndDate.facilityEndDateDay().should('have.value', '');
      facilityEndDate.facilityEndDateMonth().should('have.value', '');
      facilityEndDate.facilityEndDateYear().should('have.value', '');

      facilityEndDate.facilityEndDateDay().clear().type(tomorrowDay);
      facilityEndDate.facilityEndDateMonth().clear().type(tomorrowMonth);
      facilityEndDate.facilityEndDateYear().clear().type(tomorrowYear);
      cy.clickContinueButton();
    });
  }
});
