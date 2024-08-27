import relative from '../relativeURL';
import { backLink, errorSummary, headingCaption, mainHeading, form, continueButton, saveAndReturnButton } from '../partials';
import facilityCurrency from '../pages/facility-currency';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

context('Facility Currency Page', () => {
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
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      backLink();
      headingCaption();
      mainHeading().contains('cash');
      mainHeading().should('not.contain', 'contingent');
      facilityCurrency.hiddenFacilityType().should('not.be.visible');
      form();
      continueButton();
      saveAndReturnButton();
    });

    it('shows YEN checkbox checked', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/facility-currency`));
      facilityCurrency.yenCheckbox().should('be.checked');
    });

    it('redirects user to `provided facility` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      cy.clickBackLink();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/provided-facility`),
      );
    });

    it('shows error message when no radio button has been selected', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      cy.clickContinueButton();
      errorSummary();
      facilityCurrency.currencyError();
    });

    it('takes you to `Facility value` page when clicking on `Continue` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      facilityCurrency.yenCheckbox().click();
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
    });

    it('saves the currency and redirects user to application page when clicking on `Save and return` button', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
      cy.clickSaveAndReturnButton();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });

    it('hides back button if visiting page with `change` query', () => {
      cy.visit(
        relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency?status=change`),
      );
      backLink().should('not.exist');
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/facility-currency`));
      backLink();
      headingCaption();
      mainHeading().contains('contingent');
      mainHeading().should('not.contain', 'cash');
      form();
      facilityCurrency.hiddenFacilityType().should('not.be.visible');
      continueButton();
      saveAndReturnButton();
    });
  });
});
