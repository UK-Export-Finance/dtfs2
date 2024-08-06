import relative from '../relativeURL';
import applicationDetails from '../pages/application-details';
import facilities from '../pages/facilities';
import aboutFacility from '../pages/about-facility';
import providedFacility from '../pages/provided-facility';
import facilityValue from '../pages/facility-value';
import facilityCurrency from '../pages/facility-currency';
import facilityGuarantee from '../pages/facility-guarantee';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import bankReviewDate from '../pages/bank-review-date';
import facilityEndDate from '../pages/facility-end-date';
import { todayDay, todayMonth, todayYear } from '../../../../e2e-fixtures/dateConstants';

const applications = [];
let token;

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

context('Changing facility details from application-details page should take you to next page on facilities journey', () => {
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

  describe('Next page on facility journey', () => {
    let application;
    let facility;

    before(() => {
      application = applications[2];
      facility = application.facilities[3].details;
    });
    it('should take you to about-facility page from hasBeenIssued page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, 1).click();
      facilities.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/about-facility`));
    });

    if (!facilityEndDateEnabled) {
      it('should take you to provided-facility page from about-facility page', () => {
        cy.visit(relative(`/gef/application-details/${application.id}`));
        applicationDetails.facilitySummaryListRowAction(0, 0).click();
        aboutFacility.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/provided-facility`));
      });
    } else {
      it('should take you to bank-review-date page from about-facility page if not using facility end date ', () => {
        cy.visit(relative(`/gef/application-details/${application.id}`));
        applicationDetails.facilitySummaryListRowAction(0, 0).click();
        aboutFacility.isUsingFacilityEndDateNo().click();
        aboutFacility.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/bank-review-date`));
      });

      it('should take you to provided-facility page from bank-review-date page', () => {
        cy.visit(relative(`/gef/application-details/${application.id}`));

        applicationDetails.facilitySummaryListRowAction(0, 4).find('.govuk-link').click();

        bankReviewDate.bankReviewDateDay().type(todayDay);
        bankReviewDate.bankReviewDateMonth().type(todayMonth);
        bankReviewDate.bankReviewDateYear().type(todayYear);
        bankReviewDate.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/provided-facility`));
      });

      it('if using facility end date should take you to facility-end-date page from about-facility page', () => {
        cy.visit(relative(`/gef/application-details/${application.id}`));
        applicationDetails.facilitySummaryListRowAction(0, 0).click();
        aboutFacility.isUsingFacilityEndDateYes().click();
        aboutFacility.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/facility-end-date`));
      });

      it('should take you to provided-facility page from facility-end-date page', () => {
        cy.visit(relative(`/gef/application-details/${application.id}`));

        applicationDetails.facilitySummaryListRowAction(0, 4).find('.govuk-link').click();

        facilityEndDate.facilityEndDateDay().type(todayDay);
        facilityEndDate.facilityEndDateMonth().type(todayMonth);
        facilityEndDate.facilityEndDateYear().type(Number(todayYear) + 1);
        bankReviewDate.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/provided-facility`));
      });
    }

    it('should take you to facility-currency page from provided-facility page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, facilityEndDateEnabled ? 5 : 3).click();
      providedFacility.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/facility-currency`));
    });

    it('should take you to facility-value page from facility-currency page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, facilityEndDateEnabled ? 6 : 4).click();
      facilityCurrency.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/facility-value?status=change`));
    });

    it('should take you to facility-guarantee page from facility-value page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, facilityEndDateEnabled ? 7 : 5).click();
      facilityValue.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/facility-guarantee`));
    });

    it('should take you to application-details page from facility-guarantee page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, facilityEndDateEnabled ? 10 : 8).click();
      facilityGuarantee.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}`));
    });
  });
});
