import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import aboutFacility from '../../../pages/about-facility';

const applications = [];
let token;

context('Provided Facility Page - feature flag enabled', () => {
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

  it('redirects user to `about facility` page when clicking on `Back` Link if isUsingFacilityEndDate not selected', () => {
    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
    cy.clickBackLink();
    cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
  });

  it('redirects user to `facility end date` page when clicking on `Back` Link if using facility end date', () => {
    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
    aboutFacility.isUsingFacilityEndDateYes().click();
    cy.clickSaveAndReturnButton();

    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
    cy.clickBackLink();
    cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-end-date`));
  });

  it('redirects user to `bank review date` page when clicking on `Back` Link if not using facility end date', () => {
    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
    aboutFacility.isUsingFacilityEndDateNo().click();
    cy.clickSaveAndReturnButton();

    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
    cy.clickBackLink();
    cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/bank-review-date`));
  });

  it('The `Back` Link works after form has been validated', () => {
    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
    cy.clickContinueButton();
    errorSummary();

    cy.clickBackLink();

    cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/bank-review-date`));
  });
});
