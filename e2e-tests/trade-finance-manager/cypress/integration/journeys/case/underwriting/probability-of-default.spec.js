import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { T1_USER_1, UNDERWRITER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Pricing and risk - Probability of default', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  context('unauthorised user', () => {
    it('a user that is not in the `underwriting support` team cannot view the probability of default page', () => {
      // non-underwriting support user goes to the `Pricing and risk` page
      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting/pricing-and-risk/probability-of-default`));

      cy.url().should('eq', relative('/not-found'));
    });
  });

  context('authorised user', () => {
    beforeEach(() => {
      cy.login(UNDERWRITER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();

      // go to probability of default
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().click({ force: true });
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/probability-of-default`));
    });

    it('should display the current probability of default value in input field', () => {
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().invoke('val').then((value) => {
        expect(value.trim()).equal('14.1');
      });
    });

    it('should display validation error if necessary', () => {
      pages.underwritingProbabilityOfDefaultPage.errorSummary().should('not.exist');
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear();
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/probability-of-default`));
      pages.underwritingProbabilityOfDefaultPage.errorSummary().contains('Enter a probability of default');
      pages.underwritingProbabilityOfDefaultPage.errorList().contains('Enter a probability of default');
    });

    it('should return to pricing & risk page without updating value if cancel', () => {
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('45');
      pages.underwritingProbabilityOfDefaultPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
      pages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Less than 14.1%');
      });
    });

    it('should display validation error if value is not a number, below 0.01, above 14.09 or more than 2 decimal places', () => {
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('45');
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
      pages.underwritingProbabilityOfDefaultPage.errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorList().contains('You must enter a percentage between 0.01% to 14.09%');

      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('14.1');
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();
      pages.underwritingProbabilityOfDefaultPage.errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorList().contains('You must enter a percentage between 0.01% to 14.09%');

      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('12.123');
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();
      pages.underwritingProbabilityOfDefaultPage.errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorList().contains('You must enter a percentage between 0.01% to 14.09%');

      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('0');
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();
      pages.underwritingProbabilityOfDefaultPage.errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorList().contains('You must enter a percentage between 0.01% to 14.09%');

      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('abc');
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();
      pages.underwritingProbabilityOfDefaultPage.errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorList().contains('You must enter a percentage between 0.01% to 14.09%');
    });

    it('should update Probability of default if between 0.01 and 14.09', () => {
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('10.5');
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      pages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Less than 10.5%');
      });
    });
  });
});
