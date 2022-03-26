import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { T1_USER_1, UNDERWRITER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Pricing and risk - Loss Given Default', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
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
      pages.underwritingPricingAndRiskPage.exporterTableChangeLossGivenDefaultLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));
    });

    it('should display the current LGD value in input field', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().invoke('val').then((value) => {
        expect(value.trim()).equal('50');
      });
    });

    it('should display validation error if necessary', () => {
      pages.underwritingLossGivenDefaultPage.errorSummary().should('not.exist');
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear();
      pages.underwritingLossGivenDefaultPage.submitButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/loss-given-default`));
      pages.underwritingLossGivenDefaultPage.errorSummary().should('exist');
    });

    it('should return to pricing & risk page without updating value if cancel', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear().type('45');
      pages.underwritingLossGivenDefaultPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      pages.underwritingPricingAndRiskPage.exporterTableLossGivenDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('50%');
      });
    });

    it('should update LGD', () => {
      pages.underwritingLossGivenDefaultPage.lossGivenDefaultInput().clear().type('45');
      pages.underwritingLossGivenDefaultPage.submitButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      pages.underwritingPricingAndRiskPage.exporterTableLossGivenDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('45%');
      });
    });
  });
});
