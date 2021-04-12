/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import facilityCurrency from './pages/facility-currency';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('Facility Currency Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          cy.apiFetchAllFacilities(item._id, token)
            .then((res) => {
              applications.push({
                id: item._id,
                facilities: res.body.items.filter((it) => it.details.applicationId === item._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('Visiting page as cash facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      facilityCurrency.backLink();
      facilityCurrency.headingCaption();
      facilityCurrency.mainHeading().contains('cash');
      facilityCurrency.mainHeading().should('not.contain', 'contingent');
      facilityCurrency.form();
      facilityCurrency.continueButton();
      facilityCurrency.saveAndReturnButton();
    });

    it('shows YEN checkbox checked', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/facility-currency`));
      facilityCurrency.yenCheckbox().should('be.checked');
    });

    it('redirects user to `provided facility` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      facilityCurrency.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
    });

    it('takes you to `Facility value` page when clicking on `Continue` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      facilityCurrency.yenCheckbox().click();
      facilityCurrency.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
    });

    it('redirects user to application page when clicking on `save and return` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      facilityCurrency.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });

    it('hides back button if visiting page with `change` query', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency?status=change`));
      facilityCurrency.backLink().should('not.be', 'visible');
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[2].details._id}/facility-currency`));
      facilityCurrency.backLink();
      facilityCurrency.headingCaption();
      facilityCurrency.mainHeading().contains('contingent');
      facilityCurrency.mainHeading().should('not.contain', 'cash');
      facilityCurrency.form();
      facilityCurrency.continueButton();
      facilityCurrency.saveAndReturnButton();
    });
  });
});
