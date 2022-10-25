import relative from './relativeURL';
import facilityGuarantee from './pages/facility-guarantee';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('Facility Guarantee Page', () => {
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

  describe('Visiting facility guarantee page', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.feeTypeInAdvanceInput();
      facilityGuarantee.feeTypeInArrearsInput();
      facilityGuarantee.feeTypeAtMaturityInput();
      facilityGuarantee.dayCountBasis360Input();
      facilityGuarantee.dayCountBasis365Input();
      facilityGuarantee.doneButton();
    });

    it('redirects user to `facility value` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
    });

    it('hides back button when visiting page with `change` query', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-guarantee?status=change`));
      facilityGuarantee.backLink().should('not.exist');
    });

    it('displays errors when the fee type and day count are not selected', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.doneButton().click();
      facilityGuarantee.errorSummary();
      facilityGuarantee.feeTypeInputErrorMessage();
      facilityGuarantee.dayCountBasisInputErrorMessage();
    });

    it('displays frequency options when in advance is selected', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.feeTypeInAdvanceInput().click();
      facilityGuarantee.feeFrequencyAnnuallyInput();
      facilityGuarantee.feeFrequencyMonthlyInput();
      facilityGuarantee.feeFrequencyQuarterlyInput();
      facilityGuarantee.feeFrequencySemiAnnuallyInput();
    });

    it('displays an error when the frequency options is not chosen when in advance is selected', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.feeTypeInAdvanceInput().click();
      facilityGuarantee.feeFrequencyAnnuallyInput();
      facilityGuarantee.feeFrequencyMonthlyInput();
      facilityGuarantee.feeFrequencyQuarterlyInput();
      facilityGuarantee.feeFrequencySemiAnnuallyInput();
      facilityGuarantee.dayCountBasis365Input().click();
      facilityGuarantee.doneButton().click();
      facilityGuarantee.errorSummary();
      facilityGuarantee.feeFrequencyInputErrorMessage();
    });

    it('displays the application page when required entries are completed', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.feeTypeInAdvanceInput().click();
      facilityGuarantee.feeFrequencyAnnuallyInput().first().click();
      facilityGuarantee.dayCountBasis365Input().click();
      facilityGuarantee.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('displays the application page when in advance annually 365', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.feeTypeInAdvanceInput().click();
      facilityGuarantee.feeFrequencyAnnuallyInput().first().click();
      facilityGuarantee.dayCountBasis365Input().click();
      facilityGuarantee.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('displays the application page when in arrears annually 360', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.feeTypeInArrearsInput().click();
      facilityGuarantee.feeFrequencyAnnuallyInput().last().click();
      facilityGuarantee.dayCountBasis360Input().click();
      facilityGuarantee.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });

    it('displays the application page when fee type is at maturity', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-guarantee`));
      facilityGuarantee.feeTypeAtMaturityInput().click();
      facilityGuarantee.dayCountBasis365Input().click();
      facilityGuarantee.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[2].id}`));
    });
  });
});
