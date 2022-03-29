import relative from './relativeURL';
import facilityValuePage from './pages/facility-value';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('Facility Value Page', () => {
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
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.backLink();
      facilityValuePage.headingCaption();
      facilityValuePage.mainHeading().contains('interest');
      facilityValuePage.hiddenFacilityType().should('not.be.visible');
      facilityValuePage.valueLabel().should('contain', 'cash');
      facilityValuePage.valueSuffix().should('contain', 'EUR');
      facilityValuePage.continueButton();
    });

    it('redirects user to `facility currency` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-currency`));
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/facility-value`));
      facilityValuePage.backLink();
      facilityValuePage.headingCaption();
      facilityValuePage.mainHeading().contains('risk');
      facilityValuePage.hiddenFacilityType().should('not.be.visible');
      facilityValuePage.valueLabel().should('contain', 'contingent');
      facilityValuePage.valueSuffix().should('contain', 'JPY');
      facilityValuePage.continueButton();
    });
  });

  describe('Percentage of cover field', () => {
    it('only allows the user to enter a value between 1 and 80', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0');
      facilityValuePage.percentageCover().type('0');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.percentageCoverError();

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('-1');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.percentageCoverError();

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('a');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.percentageCoverError();

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('81');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.percentageCoverError();

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10.12345');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('1.12345');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('122.1234');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('80');
      facilityValuePage.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('1');
      facilityValuePage.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
    });
  });

  describe('Interest margin Percentage field', () => {
    it('only allows the user to enter a value between 0 and 100, and allows decimal places', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('-1');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.interestPercentageError();

      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('a');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.interestPercentageError();

      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('101');
      facilityValuePage.continueButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.interestPercentageError();

      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('1');
      facilityValuePage.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('100');
      facilityValuePage.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('79');
      facilityValuePage.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10.1');
      facilityValuePage.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
    });
  });

  describe('Save and return', () => {
    it('displays an error for interest percentage when it has an invalid entry', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('-1');
      facilityValuePage.saveAndReturnButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.interestPercentageError();
    });

    it('displays an error for percentage cover when it has an invalid entry', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('-1');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.saveAndReturnButton().click();
      facilityValuePage.errorSummary();
      facilityValuePage.percentageCoverError();
    });

    it('returns to the application page when all the fields are blank', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('returns to the application page when all the fields have valid entries', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('80');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('1');
      facilityValuePage.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('returns to the application page when percentage cover is blank and interestPercentage is valid', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('100');
      facilityValuePage.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('returns to the application page when percentage cover is valid and interestPercentage is blank', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('80');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('redirects to the currency page when currency is not set for the facility', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
    });
  });
});
