import relative from '../../../relativeURL';
import aboutFacility from '../../../pages/about-facility';
import bankReviewDate from '../../../pages/bank-review-date';
import facilityEndDate from '../../../pages/facility-end-date';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import { oneYear, today, tomorrow } from '../../../../../../e2e-fixtures/dateConstants';

const applications = [];
let token;

context('Changing between facility end date and bank review date - feature flag enabled', () => {
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

  it('should wipe the values when changing between facility end date and bank review date', () => {
    cy.visit(relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    cy.keyboardInput(aboutFacility.facilityName(), 'Name');
    aboutFacility.shouldCoverStartOnSubmissionYes().click();
    cy.keyboardInput(aboutFacility.coverEndDateDay(), today.day);
    cy.keyboardInput(aboutFacility.coverEndDateMonth(), today.month);
    cy.keyboardInput(aboutFacility.coverEndDateYear(), oneYear.year);
    aboutFacility.isUsingFacilityEndDateNo().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
    cy.fillInBankReviewDate(tomorrow.date);
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/provided-facility`));
    cy.clickBackLink();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/bank-review-date`));
    cy.clickBackLink();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/about-facility`));
    aboutFacility.isUsingFacilityEndDateYes().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${application.id}/facilities/${facilityId}/facility-end-date`));
    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), tomorrow.day);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), tomorrow.month);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), tomorrow.year);
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

    cy.fillInBankReviewDate(tomorrow.date);
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

    cy.keyboardInput(facilityEndDate.facilityEndDateDay(), tomorrow.day);
    cy.keyboardInput(facilityEndDate.facilityEndDateMonth(), tomorrow.month);
    cy.keyboardInput(facilityEndDate.facilityEndDateYear(), tomorrow.year);
    cy.clickContinueButton();
  });
});
