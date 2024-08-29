import relative from '../../relativeURL';
import partials, { errorSummary } from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, UNDERWRITER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

context('Case Underwriting - Pricing and risk - Loss Given Default', () => {
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
    it('a user that is not in the `underwriting support` team cannot view the loss given default page', () => {
      // non-underwriting support user goes to the `Pricing and risk` page
      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));

      cy.url().should('eq', relative('/not-found'));
    });
  });

  context('authorised user', () => {
    beforeEach(() => {
      cy.login(UNDERWRITER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();

      // go to loss given default
      pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().click({ force: true });
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));
    });

    it('should display the current LGD value in input field', () => {
      pages.underwritingLossGivenDefaultPage
        .lossGivenDefaultInput()
        .invoke('val')
        .then((value) => {
          expect(value.trim()).equal('50');
        });
    });

    it('should display validation error if necessary', () => {
      errorSummary().should('not.exist');
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear();
      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));
      errorSummary().should('exist');
    });

    it('should return to pricing & risk page without updating value if cancel', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear().type('45');
      pages.underwritingLossGivenDefaultPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
      pages.underwritingPricingAndRiskPage
        .exporterTableLossGivenDefault()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('50%');
        });
    });

    it('should update LGD', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear().type('45');
      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
      pages.underwritingPricingAndRiskPage
        .exporterTableLossGivenDefault()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('45%');
        });
    });
  });
});
