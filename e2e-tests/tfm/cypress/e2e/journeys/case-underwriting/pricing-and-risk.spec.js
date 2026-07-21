import relative from '../../relativeURL';
import { errorSummaryItems, caseSubNavigation } from '../../partials';
import pages from '../../pages';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { UNDERWRITING_SUPPORT_1, UNDERWRITER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';
import { assertAutocompleteInput } from '../../common-tests/assertAutocompleteInput';

const MOCK_CREDIT_RATING_TEXT_INPUT_VALUE = 'B+';

const autoCompleteField = pages.autoCompleteField('exporterCreditRatingOther');

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
      cy.login(UNDERWRITING_SUPPORT_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      caseSubNavigation.underwritingLink().click();
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
      cy.login(UNDERWRITER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      // go to pricing and risk page
      caseSubNavigation.underwritingLink().click();
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

      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableCreditRatingNotAddedTag(), 'Not added');

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().should('contain', 'Add');
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/edit`));
    });

    it('submitting an empty edit form displays validation errors', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputValidationError().should('be.visible');
    });

    it('selecting `Other` in edit form displays a heading and text input. After submit - displays validation errors if text input is empty', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();

      cy.assertText(pages.underwritingPricingAndRiskEditPage.creditRatingOtherLabel(), 'Credit rating');

      autoCompleteField.input().should('be.visible');
      autoCompleteField.input().should('have.value', '');
      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      autoCompleteField.input().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError().should('be.visible');
      cy.assertText(pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError(), 'Error: Enter a credit rating');
    });

    it('typing a credit risk which does not exist into `Other` text input displays validation errors after submit', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      autoCompleteField.input().should('be.visible');
      autoCompleteField.input().should('have.value', '');
      cy.keyboardInput(autoCompleteField.input(), 'abc1');
      cy.clickSubmitButton();

      errorSummaryItems().should('have.length', 1);
      autoCompleteField.input().should('be.visible');
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError().should('be.visible');
      cy.assertText(pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOtherValidationError(), 'Error: Enter a credit rating');
    });

    it('submitting a rating displays the rating in table on `pricing and risk` page and renders `change credit rating` link', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      // select option, submit
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().click();
      cy.clickSubmitButton();

      // assert elements/value in `pricing and risk` page
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().should('contain', 'Change');

      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableRatingValue(), 'Good (BB-)');
    });

    it('after submitting a rating, editing the rating has default value and new rating displays in `pricing and risk` page', () => {
      // check value previously submitted
      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableRatingValue(), 'Good (BB-)');

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      // previously submitted value should be auto selected
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().should('be.checked');

      // submit different value
      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputAcceptable().click();
      cy.clickSubmitButton();

      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));

      // check new value displays in `pricing and risk` page
      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableRatingValue(), 'Acceptable (B+)');
    });

    it('submitting `Other` in edit form displays text input and auto populates values after submit', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      autoCompleteField.input().should('have.value', '');

      cy.keyboardInput(autoCompleteField.input(), MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOption(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE).click();
      cy.clickSubmitButton();

      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableRatingValue(), MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().should('be.checked');
      autoCompleteField.input().should('exist');

      cy.assertText(autoCompleteField.results(), MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      cy.assertValue(autoCompleteField, MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
    });

    it('should use last submitted other value if revisiting the edit form and clearing the other input', () => {
      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();

      cy.keyboardInput(autoCompleteField.input(), MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOption(MOCK_CREDIT_RATING_TEXT_INPUT_VALUE).click();
      cy.clickSubmitButton();

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      // clear the input and submit
      autoCompleteField.input().clear();
      cy.clickSubmitButton();

      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableRatingValue(), MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });

      cy.assertText(autoCompleteField.results(), MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
      cy.assertValue(autoCompleteField, MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);
    });

    describe('credit rating `Other` autocomplete page tests', () => {
      beforeEach(() => {
        pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().click({ force: true });
        pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
      });

      assertAutocompleteInput({
        fieldId: 'exporterCreditRatingOther',
        noResultsText: 'Z',
        singleResultText: 'BBB+',
        multipleResultsText: 'A',
        entry1Text: 'B+',
        entry2Text: 'BB-',
      });
    });
  });

  describe('a user that is not in the `underwriters` or `underwriter managers`', () => {
    beforeEach(() => {
      cy.login(UNDERWRITING_SUPPORT_1);

      cy.visit(`/case/${dealId}/underwriting`);
      cy.url().should('eq', relative(`/case/${dealId}/underwriting`));
    });

    it('cannot add or edit a credit rating', () => {
      // double check that a credit rating already exists from previous tests
      cy.assertText(pages.underwritingPricingAndRiskPage.exporterTableRatingValue(), MOCK_CREDIT_RATING_TEXT_INPUT_VALUE);

      pages.underwritingPricingAndRiskPage.exporterTableChangeOrAddCreditRatingLink().should('not.exist');
      pages.underwritingPricingAndRiskPage.exporterTableChangeProbabilityOfDefaultLink().should('not.exist');
    });

    it('cannot manually navigate to the edit page', () => {
      cy.visit(`/case/${dealId}/underwriting/pricing-and-risk/edit`, { failOnStatusCode: false });
      cy.url().should('eq', relative('/not-found'));
    });
  });
});
