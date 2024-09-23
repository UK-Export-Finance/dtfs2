import relative from '../../../relativeURL';
import { backLink, continueButton, headingCaption, errorSummary, mainHeading, form, saveAndReturnButton } from '../../../partials';
import providedFacility from '../../../pages/provided-facility';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import aboutFacility from '../../../pages/about-facility';

const applications = [];
let token;

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

context('Provided Facility Page', () => {
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

  describe('Visiting page as cash facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      backLink();
      headingCaption();
      mainHeading().contains('cash');
      mainHeading().should('not.contain', 'contingent');
      form();
      providedFacility.hiddenFacilityType().should('not.be.visible');
      providedFacility.detailsOther().should('not.be.visible');
      continueButton();
      saveAndReturnButton();
    });

    if (!facilityEndDateEnabled) {
      it('redirects user to `about facility` page when clicking on `Back` Link ', () => {
        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
        cy.clickBackLink();
        cy.url().should(
          'eq',
          relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`),
        );
      });

      it('The `Back` Link works after form has been validated', () => {
        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
        cy.clickContinueButton();
        errorSummary();

        cy.clickBackLink();

        cy.url().should(
          'eq',
          relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`),
        );
      });
    } else {
      it('redirects user to `about facility` page when clicking on `Back` Link if isUsingFacilityEndDate not selected', () => {
        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
        cy.clickBackLink();
        cy.url().should(
          'eq',
          relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`),
        );
      });

      it('redirects user to `facility end date` page when clicking on `Back` Link if using facility end date', () => {
        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
        aboutFacility.isUsingFacilityEndDateYes().click();
        cy.clickSaveAndReturnButton();

        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
        cy.clickBackLink();
        cy.url().should(
          'eq',
          relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-end-date`),
        );
      });

      it('redirects user to `bank review date` page when clicking on `Back` Link if not using facility end date', () => {
        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/about-facility`));
        aboutFacility.isUsingFacilityEndDateNo().click();
        cy.clickSaveAndReturnButton();

        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
        cy.clickBackLink();
        cy.url().should(
          'eq',
          relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/bank-review-date`),
        );
      });

      it('The `Back` Link works after form has been validated', () => {
        cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
        cy.clickContinueButton();
        errorSummary();

        cy.clickBackLink();

        cy.url().should(
          'eq',
          relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/bank-review-date`),
        );
      });
    }

    it('clicking continue without selecting any options shows error messages', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      cy.clickContinueButton();

      errorSummary().contains('You must select at least one option');
      mainHeading().contains('You must select at least one option');
    });

    it('clicking on `Other` checkbox shows `Enter details` textarea field', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.otherCheckbox().click();
      providedFacility.detailsOther().should('be.visible');
    });

    it('leaving `Enter details` empty shows an error message', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.otherCheckbox().click();
      cy.clickContinueButton();
      providedFacility.detailsOtherError().should('be.visible');
    });

    it('filling in `Enter details` and clicking on `Continue` takes user to currency page', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      providedFacility.otherCheckbox().click();
      cy.keyboardInput(providedFacility.detailsOther(), 'some text here');
      cy.clickContinueButton();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`),
      );
    });

    it('redirects user to application page when clicking on `save and return` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`));
      cy.clickSaveAndReturnButton();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });

    it('hides back button if visiting page with `change` query', () => {
      cy.visit(
        relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility?status=change`),
      );
      backLink().should('not.be.exist');
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/provided-facility`));
      backLink();
      headingCaption();
      mainHeading().contains('contingent');
      mainHeading().should('not.contain', 'cash');
      form();
      providedFacility.hiddenFacilityType().should('not.be.visible');
      providedFacility.detailsOther();
      continueButton();
      saveAndReturnButton();
    });
  });
});
