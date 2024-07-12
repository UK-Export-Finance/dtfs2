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

const applications = [];
let token;

const now = new Date();

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
              version: item.version,
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
      it('if not using facility end date should take you to bank-review-date page from about-facility page', () => {
        cy.visit(relative(`/gef/application-details/${application.id}`));
        applicationDetails.facilitySummaryListRowAction(0, 0).click();
        aboutFacility.isUsingFacilityEndDateNo().click();
        aboutFacility.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/bank-review-date`));
      });

      it('should take you to provided-facility page from bank-review-date page', () => {
        // TODO DTFS2-7162: should click on row to visit bank-review-date page
        cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facility._id}/bank-review-date`));
        bankReviewDate.bankReviewDateDay().type(now.getDate());
        bankReviewDate.bankReviewDateMonth().type(now.getMonth());
        bankReviewDate.bankReviewDateYear().type(now.getFullYear() + 1);
        bankReviewDate.continueButton().click();
        cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/provided-facility`));
      });
    }

    it('should take you to facility-currency page from provided-facility page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, 3).click();
      providedFacility.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/facility-currency`));
    });

    it('should take you to facility-value page from facility-currency page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, 4).click();
      facilityCurrency.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/facility-value?status=change`));
    });

    it('should take you to facility-guarantee page from facility-value page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, 6).click();
      facilityValue.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facility._id}/facility-guarantee`));
    });

    it('should take you to application-details page from facility-guarantee page', () => {
      cy.visit(relative(`/gef/application-details/${application.id}`));
      applicationDetails.facilitySummaryListRowAction(0, 8).click();
      facilityGuarantee.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${application.id}`));
    });
  });
});
