import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { RISK_MANAGER_1 } from '../../../../../../fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Pricing and risk for Risk Managers', () => {
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

  describe('users in the `RISK_MANAGERS` group should be able to edit', () => {
    beforeEach(() => {
      cy.login(RISK_MANAGER_1);

      cy.visit(`/case/${dealId}/underwriting/pricing-and-risk`);
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
    });

    it('submitting a rating displays the rating in table on `pricing and risk` page and does not render `add credit rating` link', () => {
      pages.underwritingPricingAndRiskPage.addRatingLink().click();

      // select option, submit
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().click();
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      // assert elements/value in `pricing and risk` page
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

      pages.underwritingPricingAndRiskPage.addRatingLink().should('not.exist');

      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('be.visible');

      pages.underwritingPricingAndRiskPage.exporterTableRatingValue().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Good (BB-)');
      });
    });

    it('after submitting a rating, editing the rating has default value and new rating displays in `pricing and risk` page', () => {
      // check value previously submitted
      pages.underwritingPricingAndRiskPage.exporterTableRatingValue().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Good (BB-)');
      });

      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().click();

      // previously submitted value should be auto selected
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().should('be.checked');

      // submit different value
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputAcceptable().click();
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

      // check new value displays in `pricing and risk` page
      pages.underwritingPricingAndRiskPage.exporterTableRatingValue().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Acceptable (B+)');
      });
    });
  });

  describe('Risk Managers can edit once logged in', () => {
    beforeEach(() => {
      cy.login(RISK_MANAGER_1);

      cy.visit(`/case/${dealId}/underwriting/pricing-and-risk`);
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
    });

    it('edit button is visible as compared to add', () => {
      pages.underwritingPricingAndRiskPage.addRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('exist');
    });
  });
});
