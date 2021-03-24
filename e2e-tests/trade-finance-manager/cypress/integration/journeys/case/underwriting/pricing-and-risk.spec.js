import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL from '../../../../fixtures/deal';
import MOCK_USERS from '../../../../fixtures/users';

const MOCK_MAKER_TFM = {
  username: 'MAKER-TFM',
  password: 'AbC!2345',
  firstname: 'Tamil',
  surname: 'Rahani',
  email: 'maker@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'checker@ukexportfinance.gov.uk',
    ],
  },
};

const ADMIN_LOGIN = {
  username: 'ADMIN',
  password: 'AbC!2345',
  firstname: 'Julius',
  surname: 'No',
  email: '',
  timezone: 'Europe/London',
  roles: ['maker', 'editor', 'admin'],
  bank: {
    id: '*',
  },
};

context('Case Underwriting - Pricing and risk', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });

  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to edit page
    partials.caseSubNavigation.underwritingLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('clicking underwriting nav link should direct to pricing-and-risk page and render `add rating` link. Clicking `add rating` takes user to edit page', () => {
    pages.underwritingPricingAndRiskPage.addRatingLink().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk/edit`));
  });

  it('submitting an empty edit form displays validation errors', () => {
    pages.underwritingPricingAndRiskPage.addRatingLink().click();

    pages.underwritingPricingAndRiskEditPage.submitButton().click();

    pages.underwritingPricingAndRiskEditPage.errorSummaryItems().should('have.length', 1);
    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputValidationError().should('be.visible');
  });

  it('selecting `Other` in edit form displays text input. After submit - displays validation errors if text input incomplete', () => {
    pages.underwritingPricingAndRiskPage.addRatingLink().click();

    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();
    pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
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

    pages.underwritingPricingAndRiskPage.addRatingLink().should('not.be.visible');

    pages.underwritingPricingAndRiskPage.creditRatingTableChangeLink().should('be.visible');

    pages.underwritingPricingAndRiskPage.creditRatingTableRatingValue().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Good (BB-)');
    });
  });

  it('after submitting a rating, editing the rating has default value and new rating displays in `pricing and risk` page', () => {
    pages.underwritingPricingAndRiskPage.creditRatingTableChangeLink().click();

    // previously submitted value should be auto selected
    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputGood().should('be.checked');

    // submit different value
    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputAcceptable().click();
    pages.underwritingPricingAndRiskEditPage.submitButton().click();

    cy.url().should('eq', relative(`/case/${dealId}/underwriting/pricing-and-risk`));

    // check new value displays in `pricing and risk` page
    pages.underwritingPricingAndRiskPage.creditRatingTableRatingValue().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acceptable (B+)');
    });
  });

  it('submitting `Other` in edit form displays text input and values after submit', () => {
    pages.underwritingPricingAndRiskPage.creditRatingTableChangeLink().click();

    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().click();

    const MOCK_TEXT_INPUT_VALUE = 'Testing';
    pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().type(MOCK_TEXT_INPUT_VALUE);
    pages.underwritingPricingAndRiskEditPage.submitButton().click();

    // pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');

    pages.underwritingPricingAndRiskPage.creditRatingTableRatingValue().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_TEXT_INPUT_VALUE);
    });

    pages.underwritingPricingAndRiskPage.creditRatingTableChangeLink().click();

    pages.underwritingPricingAndRiskEditPage.creditRatingRadioInputOther().should('be.checked');
    pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('be.visible');
    pages.underwritingPricingAndRiskEditPage.creditRatingTextInputOther().should('have.value', MOCK_TEXT_INPUT_VALUE);
  });
});
