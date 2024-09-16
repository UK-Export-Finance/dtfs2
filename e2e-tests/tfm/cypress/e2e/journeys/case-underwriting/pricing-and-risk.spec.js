import relative from '../../relativeURL';
import partials from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { UNDERWRITING_SUPPORT_1, UNDERWRITER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

const MOCK_CREDIT_RATING_TEXT_INPUT_VALUE = 'Testing';

context('Case Underwriting - Pricing and risk', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, UNDERWRITER_1);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  describe('when unable to edit', () => {
    beforeEach(() => {
      cy.login({ user: UNDERWRITING_SUPPORT_1 });
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
    });

    it('should NOT display `change` links', () => {
      pages.underwritingPage.exporterTableChangeOrAddCreditRatingLink().should('not.exist');
      pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().should('not.exist');
      pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');
    });
  });

  describe('when able to edit', () => {
    beforeEach(() => {
      cy.login({ user: UNDERWRITER_1 });
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      partials.caseSubNavigation.underwritingLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
    });

    it('should display the correct change links', () => {
      pages.underwritingPage.showAllButton().click();

      pages.underwritingPage.exporterTableChangeOrAddCreditRatingLink().should('contain', 'Add');
      pages.underwritingPage.exporterTableChangeLossGivenDefaultLink().should('exist');
      pages.underwritingPage.exporterTableChangeProbabilityOfDefaultLink().should('exist');
    });

    it('clicking underwriting nav link should direct to pricing-and-risk page and render `Not added` tag and `add rating` link. Clicking `add rating` takes user to edit page', () => {
      pages.underwritingPricingAndRiskPage.exporterTableCreditRatingNotAddedTag().should('exist');

      pages.underwritingPricingAndRiskPage
        .exporterTableCreditRatingNotAddedTag()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Not added');
        });

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().should('contain', 'Add');
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/edit`));
    });

    it('submitting an empty edit form displays validation errors', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskEditPage.errorSummaryItems().should('have.length', 1);
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputValidationError().should('be.visible');
    });

    it('selecting `Other` in edit form displays text input. After submit - displays validation errors if text input is empty', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', '');
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskEditPage.errorSummaryItems().should('have.length', 1);
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError().should('be.visible');
    });

    it('typing numbers into `Other` text input displays validation errors after submit', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', '');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().type('abc1');
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskEditPage.errorSummaryItems().should('have.length', 1);
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError().should('be.visible');
    });

    it('submitting a rating displays the rating in table on `pricing and risk` page and renders `change credit rating` link', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      // select option, submit
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().click();
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      // assert elements/value in `pricing and risk` page
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().should('contain', 'Change');

      pages.underwritingPricingAndRiskPage
        .exporterTableRatingValue()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Good (BB-)');
        });
    });

    it('after submitting a rating, editing the rating has default value and new rating displays in `pricing and risk` page', () => {
      // check value previously submitted
      pages.underwritingPricingAndRiskPage
        .exporterTableRatingValue()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Good (BB-)');
        });

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      // previously submitted value should be auto selected
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().should('be.checked');

      // submit different value
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputAcceptable().click();
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

      // check new value displays in `pricing and risk` page
      pages.underwritingPricingAndRiskPage
        .exporterTableRatingValue()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal('Acceptable (B+)');
        });
    });

    it('submitting `Other` in edit form displays text input and auto populates values after submit', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', '');

      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().type(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      pages.underwritingPricingAndRiskEditPage.submitButton().click();

      pages.underwritingPricingAndRiskPage
        .exporterTableRatingValue()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
        });

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().should('be.checked');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('exist');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
    });
  });

  describe('a user that is not in the `underwriters` or `underwriter managers`', () => {
    beforeEach(() => {
      cy.login({ user: UNDERWRITING_SUPPORT_1 });
      cy.visit(`/case/${dealId}/underwriting`);
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
    });

    it('cannot add or edit a credit rating', () => {
      // double check that a credit rating already exists from previous tests
      pages.underwritingPricingAndRiskPage
        .exporterTableRatingValue()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
        });

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');
    });

    it('cannot manually navigate to the edit page', () => {
      cy.visit(`/case/${dealId}/underwriting/pricing-and-risk/edit`);
      cy.url().should('eq', relative('/not-found'));
    });
  });
});
