import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case Underwriting - Pricing and risk for Risk Managers', () => {
  let dealId;
  const dealFacilities = [];
  const riskManagerUser = MOCK_USERS.find((user) => user.teams.includes('RISK_MANAGERS'));

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN);

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
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  describe('users in the `RISK_MANAGERS` group should be able to edit', () => {
    beforeEach(() => {
      cy.login(riskManagerUser);

      cy.visit(`/case/${dealId}/underwriting/pricing-and-risk`);
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
    });

    it('can add a credit rating', () => {
      pages.underwritingPricingAndRiskPage.addRatingLink().should('be.visible');
      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeLossGivenDefaultLink().should('be.visible');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('be.visible');
    });

    it('clicking underwriting nav link should direct to pricing-and-risk page and render `Not added` tag and `add rating` link. Clicking `add rating` takes user to edit page', () => {
      pages.underwritingPricingAndRiskPage.exporterTableCreditRatingNotAddedTag().should('be.visible');

      pages.underwritingPricingAndRiskPage.exporterTableCreditRatingNotAddedTag().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Not added');
      });

      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('not.exist');

      pages.underwritingPricingAndRiskPage.addRatingLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/edit`));
    });

    it('submitting an empty edit form displays validation errors', () => {
      pages.underwritingPricingAndRiskPage.addRatingLink().click();

      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskEditPage.errorSummaryItems().should('have.length', 1);
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputValidationError().should('be.visible');
    });

    it('selecting `Other` in edit form displays text input. After submit - displays validation errors if text input is empty', () => {
      pages.underwritingPricingAndRiskPage.addRatingLink().click();

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', '');
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskEditPage.errorSummaryItems().should('have.length', 1);
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError().should('be.visible');
    });

    it('typing numbers into `Other` text input displays validation errors after submit', () => {
      pages.underwritingPricingAndRiskPage.addRatingLink().click();

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', '');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().type('abc1');
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskEditPage.errorSummaryItems().should('have.length', 1);
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError().should('be.visible');
    });
  });
});
