import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

context('Provided Facility Page - feature flag disabled', () => {
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
  it('redirects user to `about facility` page when clicking on `Back` Link ', () => {
    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
    cy.clickBackLink();
    cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
  });

  it('The `Back` Link works after form has been validated', () => {
    cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
    cy.clickContinueButton();
    errorSummary();

    cy.clickBackLink();

    cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
  });
});
