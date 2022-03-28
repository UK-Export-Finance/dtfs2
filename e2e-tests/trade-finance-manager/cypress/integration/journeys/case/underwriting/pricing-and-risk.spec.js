import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { UNDERWRITING_SUPPORT_1, UNDERWRITER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

const MOCK_CREDIT_RATING_TEXT_INPUT_VALUE = 'Testing';

context('Case Underwriting - Pricing and risk', () => {
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

  describe('when unable to edit', () => {
    beforeEach(() => {
      cy.login(UNDERWRITING_SUPPORT_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
      partials.underwritingSubNav.underwritingHeading().contains('Underwriting');
      partials.underwritingSubNav.underwritingHeading().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('Underwriting page: pricing and risk');
      });
    });

    it('should NOT display `change` links', () => {
      pages.underwritingPricingAndRiskPage.addRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeLossGivenDefaultLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');
    });
  });

  describe('when able to edit', () => {
    beforeEach(() => {
      cy.login(UNDERWRITER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
    });

    it('should display the correct change links', () => {
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

    it('submitting `Other` in edit form displays text input and auto populates values after submit', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().click();

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', '');

      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().type(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskPage.exporterTableRatingValue().invoke('text').then((text) => {
        expect(text.trim()).to.equal(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      });

      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().click();

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().should('be.checked');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
    });
  });

  describe('a user that is not in the `underwriters` or `underwriter managers`', () => {
    beforeEach(() => {
      cy.login(UNDERWRITING_SUPPORT_1);

      cy.visit(`/case/${dealId}/underwriting/pricing-and-risk`);
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
    });

    it('cannot add or edit a credit rating', () => {
      // double check that a credit rating already exists from previous tests
      pages.underwritingPricingAndRiskPage.exporterTableRatingValue().invoke('text').then((text) => {
        expect(text.trim()).to.equal(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      });

      pages.underwritingPricingAndRiskPage.addRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeCreditRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');
    });

    it('cannot manually navigate to the edit page', () => {
      cy.visit(`/case/${dealId}/underwriting/pricing-and-risk/edit`);
      cy.url().should('eq', relative('/not-found'));
    });
  });
});
