import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
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
      const nonUnderWritingSupportUser = MOCK_USERS.find((user) =>
        !user.teams.includes('UNDERWRITERS'));

      cy.login(nonUnderWritingSupportUser);
      cy.visit(relative(`/case/${dealId}/underwriting/pricing-and-risk/probability-of-default`));

      cy.url().should('eq', relative('/not-found'));
    });
  });

  context('authorised user', () => {
    beforeEach(() => {
      const underWritingSupportUser = MOCK_USERS.find((user) =>
        user.teams.includes('UNDERWRITERS'));

      cy.login(underWritingSupportUser);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();

      // go to probability of default
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().click();
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
      pages.underwritingProbabilityOfDefaultPage.errorSummary().should('exist');
    });

    it('should return to pricing & risk page without updating value if cancel', () => {
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('45');
      pages.underwritingProbabilityOfDefaultPage.closeLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      pages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Less than 14.1%');
      });
    });

    it('should update Probability of default', () => {
      pages.underwritingProbabilityOfDefaultPage.probabilityOfDefaultInput().clear().type('45');
      pages.underwritingProbabilityOfDefaultPage.submitButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      pages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Less than 45%');
      });
    });
  });
});
