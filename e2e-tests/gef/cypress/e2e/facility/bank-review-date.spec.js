import relative from '../relativeURL';
import bankReviewDate from '../pages/bank-review-date';

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

    it('redirects the user to `provided facility` page when form has been successfully filled in', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.bankReviewDateDay().type(now.getDate());
      bankReviewDate.bankReviewDateMonth().type(now.getMonth());
      bankReviewDate.bankReviewDateYear().type(now.getFullYear() + 1);

      bankReviewDate.continueButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
    });

    it('stores the inputted values', () => {
      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));

      bankReviewDate.bankReviewDateDay().type(now.getDate());
      bankReviewDate.bankReviewDateMonth().type(now.getMonth());
      bankReviewDate.bankReviewDateYear().type(now.getFullYear() + 1);

      bankReviewDate.continueButton().click();

      cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
      bankReviewDate.bankReviewDateDay().should('have.value', now.getDate());
      bankReviewDate.bankReviewDateMonth().should('have.value', now.getMonth());
      bankReviewDate.bankReviewDateYear().should('have.value', now.getFullYear() + 1);
    });
  });
});
