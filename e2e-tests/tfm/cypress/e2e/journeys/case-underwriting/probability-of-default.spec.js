import relative from '../../relativeURL';
import { caseSubNavigation, errorSummary } from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, UNDERWRITER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Case Underwriting - Pricing and risk - Probability of default', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
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
      caseSubNavigation.underwritingLink().click();

      // go to probability of default
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().click({ force: true });
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/probability-of-default`));
    });

    it('should display the current probability of default value in input field', () => {
      pages.underwritingProbabilityOfDefaultPage
        .probabilityOfDefaultInput()
        .invoke('val')
        .then((value) => {
          expect(value.trim()).equal('14.1');
        });
    });

    it('should display validation error if necessary', () => {
      errorSummary().should('not.exist');
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear();
      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/probability-of-default`));
      errorSummary().contains('Enter a probability of default');
      pages.underwritingProbabilityOfDefaultPage.errorMessage().contains('Enter a probability of default');
    });

    it('should return to pricing & risk page without updating value if cancel', () => {
      cy.keyboardInput(pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput(), '45');
      pages.underwritingProbabilityOfDefaultPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault(), 'Less than 14.1%');
    });

    it('should display validation error if value is not a number, below 0.01, above 14.09 or more than 2 decimal places', () => {
      cy.keyboardInput(pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput(), '15');
      cy.clickSubmitButton();
      errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorMessage().contains('You must enter a percentage between 0.01% to 14.09%');

      cy.keyboardInput(pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput(), '14.1');
      cy.clickSubmitButton();
      errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorMessage().contains('You must enter a percentage between 0.01% to 14.09%');

      cy.keyboardInput(pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput(), '12.123');
      cy.clickSubmitButton();
      errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorMessage().contains('You must enter a percentage between 0.01% to 14.09%');

      cy.keyboardInput(pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput(), '0');
      cy.clickSubmitButton();
      errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorMessage().contains('You must enter a percentage between 0.01% to 14.09%');

      cy.keyboardInput(pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput(), 'abc');
      cy.clickSubmitButton();
      errorSummary().contains('You must enter a percentage between 0.01% to 14.09%');
      pages.underwritingProbabilityOfDefaultPage.errorMessage().contains('You must enter a percentage between 0.01% to 14.09%');
    });

    it('should update Probability of default if between 0.01 and 14.09', () => {
      cy.keyboardInput(pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput(), '10.5');
      cy.clickSubmitButton();

      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault(), 'Less than 10.5%');
    });
  });
});
