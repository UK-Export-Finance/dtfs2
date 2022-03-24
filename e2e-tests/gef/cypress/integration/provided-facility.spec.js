import relative from './relativeURL';
import providedFacility from './pages/provided-facility';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('Provided Facility Page', () => {
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
                facilities: res.body.items.filter((it) => it.details.dealId === item._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('Visiting page as cash facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.backLink();
      providedFacility.headingCaption();
      providedFacility.mainHeading().contains('cash');
      providedFacility.mainHeading().should('not.contain', 'contingent');
      providedFacility.form();
      providedFacility.hiddenFacilityType().should('not.be.visible');
      providedFacility.detailsOther().should('not.be.visible');
      providedFacility.continueButton();
      providedFacility.saveAndReturnButton();
    });

    it('redirects user to `about facility` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
    });

    it('clicking continue without selecting any options shows error messages', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.continueButton().click();

      providedFacility.errorSummary().contains('You must select at least one option');
      providedFacility.mainHeading().contains('You must select at least one option');
    });

    it('clicking on `Other` checkbox shows `Enter details` textarea field', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.otherCheckbox().click();
      providedFacility.detailsOther().should('be.visible');
    });

    it('leaving `Enter details` empty shows an error message', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.otherCheckbox().click();
      providedFacility.continueButton().click();
      providedFacility.detailsOtherError().should('be.visible');
    });

    it('filling in `Enter details` and clicking on `Continue` takes user to currency page', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.otherCheckbox().click();
      providedFacility.detailsOther().type('some text here');
      providedFacility.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
    });

    it('redirects user to application page when clicking on `save and return` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });

    it('hides back button if visiting page with `change` query', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility?status=change`));
      providedFacility.backLink().should('not.be.exist');
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/provided-facility`));
      providedFacility.backLink();
      providedFacility.headingCaption();
      providedFacility.mainHeading().contains('contingent');
      providedFacility.mainHeading().should('not.contain', 'cash');
      providedFacility.form();
      providedFacility.hiddenFacilityType().should('not.be.visible');
      providedFacility.detailsOther();
      providedFacility.continueButton();
      providedFacility.saveAndReturnButton();
    });
  });
});
