import relative from '../relativeURL';
import { backLink, errorSummary, headingCaption, mainHeading, continueButton, saveAndReturnButton } from '../partials';
import facilityValuePage from '../pages/facility-value';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

const applications = [];
let token;

context('Facility Value Page', () => {
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
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      backLink();
      headingCaption();
      mainHeading().contains('interest');
      facilityValuePage.hiddenFacilityType().should('not.be.visible');
      facilityValuePage.valueLabel().should('contain', 'cash');
      facilityValuePage.valueSuffix().should('contain', 'EUR');
      continueButton();
    });

    it('redirects user to `facility currency` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      cy.clickBackLink();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-currency`),
      );
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/facility-value`));
      backLink();
      headingCaption();
      mainHeading().contains('risk');
      facilityValuePage.hiddenFacilityType().should('not.be.visible');
      facilityValuePage.valueLabel().should('contain', 'contingent');
      facilityValuePage.valueSuffix().should('contain', 'JPY');
      continueButton();
    });
  });

  describe('Percentage of cover field', () => {
    it('only allows the user to enter a value between 1 and 80', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10');
      facilityValuePage.percentageCover().type('0');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 1 and 80');
      facilityValuePage.percentageCoverError().contains('You can only enter a number between 1 and 80');

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('-1');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 1 and 80');
      facilityValuePage.percentageCoverError().contains('You can only enter a number between 1 and 80');

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('a');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 1 and 80');
      facilityValuePage.percentageCoverError().contains('You can only enter a number between 1 and 80');

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('81');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 1 and 80');
      facilityValuePage.percentageCoverError().contains('You can only enter a number between 1 and 80');

      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('80');
      continueButton().click();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`),
      );

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('1');
      continueButton().click();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`),
      );

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10');
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      continueButton().click();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`),
      );
    });
  });

  describe('Interest margin Percentage field', () => {
    it('only allows the user to enter a value between 0.0001 and 99, and allows decimal places', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('-1');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('a');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('101');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('1');
      continueButton().click();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`),
      );

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('100');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0.0000');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('0.12345');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('99.0001');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('-5');
      continueButton().click();
      errorSummary().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');
      facilityValuePage.interestPercentageError().contains('You can only enter a number between 0.0001 and 99 and can have up to 4 decimal places');

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('99.0000');
      continueButton().click();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`),
      );

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('79');
      continueButton().click();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`),
      );

      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('79');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('10.1');
      continueButton().click();
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`),
      );
    });
  });

  describe('Save and return', () => {
    it('displays an error for interest percentage when it has an invalid entry', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('-1');
      saveAndReturnButton().click();
      errorSummary();
      facilityValuePage.interestPercentageError();
    });

    it('displays an error for percentage cover when it has an invalid entry', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('-1');
      facilityValuePage.interestPercentage().clear();
      saveAndReturnButton().click();
      errorSummary();
      facilityValuePage.percentageCoverError();
    });

    it('returns to the application page when all the fields are blank', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.interestPercentage().clear();
      saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('returns to the application page when all the fields have valid entries', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('80');
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('1');
      saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('returns to the application page when percentage cover is blank and interestPercentage is valid', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.interestPercentage().clear();
      facilityValuePage.interestPercentage().type('80');
      saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('returns to the application page when percentage cover is valid and interestPercentage is blank', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValuePage.percentageCover().clear();
      facilityValuePage.percentageCover().type('80');
      facilityValuePage.interestPercentage().clear();
      saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('redirects to the currency page when currency is not set for the facility', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      cy.url().should(
        'eq',
        relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`),
      );
    });
  });
});
