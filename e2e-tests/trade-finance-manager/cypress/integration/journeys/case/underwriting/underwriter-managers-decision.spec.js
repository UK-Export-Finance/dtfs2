import moment from 'moment';
import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
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
  teams: ['UNDERWRITING_SUPPORT'],
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
  let underWritingManager;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  beforeEach(() => {
    underWritingManager = MOCK_USERS.find((user) =>
      user.teams.includes('UNDERWRITER_MANAGERS'));

    cy.login(underWritingManager);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.underwriterManagerDecisionLink().click();
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('clicking `underwriting managers decision` nav link should direct to underwriting-managers-decision form', () => {
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/managers-decision`));
  });

  it('a user that is NOT in UNDERWRITER_MANAGERS team should get redirected to not-found route', () => {
    const nonUnderWritingManager = MOCK_USERS.find((user) =>
      !user.teams.includes('UNDERWRITER_MANAGERS'));

    cy.login(nonUnderWritingManager);
    cy.visit(relative(`/case/${dealId}/deal`));

    // go to underwriter managers decision page
    partials.caseSubNavigation.underwritingLink().click();
    partials.underwritingSubNav.underwriterManagerDecisionLink().click();

    cy.url().should('eq', relative('/not-found'));
  });

  it('submitting an empty form displays validation errors', () => {
    pages.managersDecisionFormPage.submitButton().click();

    pages.managersDecisionFormPage.errorSummaryItems().should('have.length', 1);
    pages.managersDecisionFormPage.decisionRadioInputValidationError().should('be.visible');
  });

  it('selecting `Approve with conditions` radio button reveals comments input, throws validation error if no comment provided and persists radio selection', () => {
    pages.managersDecisionFormPage.commentsInputApproveWithConditionsValidationError().should('not.be.visible');

    pages.managersDecisionFormPage.decisionRadioInputApproveWithConditions().click();
    pages.managersDecisionFormPage.commentsInputApproveWithConditions().should('be.visible');
    pages.managersDecisionFormPage.submitButton().click();

    // radio should be selected
    pages.managersDecisionFormPage.decisionRadioInputApproveWithConditions().should('be.checked');

    // assert errors are displayed
    pages.managersDecisionFormPage.errorSummaryItems().should('have.length', 1);
    pages.managersDecisionFormPage.commentsInputApproveWithConditionsValidationError().should('be.visible');
  });

  it('selecting `Decline` radio button reveals comments input, throws validation error if no comment provided  and persists radio selection', () => {
    pages.managersDecisionFormPage.commentsInputApproveWithConditionsValidationError().should('not.be.visible');

    pages.managersDecisionFormPage.decisionRadioInputDecline().click();
    pages.managersDecisionFormPage.commentsInputDecline().should('be.visible');
    pages.managersDecisionFormPage.submitButton().click();

    // radio should be selected
    pages.managersDecisionFormPage.decisionRadioInputDecline().should('be.checked');

    // assert errors are displayed
    pages.managersDecisionFormPage.errorSummaryItems().should('have.length', 1);
    pages.managersDecisionFormPage.commentsInputDeclineValidationError().should('be.visible');
  });

  it('after valid form submit, redirects to `/submitted` route and displays submitted values', () => {
    const MOCK_COMMENTS = 'Testing';
    const MOCK_INTERNAL_COMMENTS = 'Internal comment';

    pages.managersDecisionFormPage.decisionRadioInputApproveWithConditions().click();

    pages.managersDecisionFormPage.commentsInputApproveWithConditions().type(MOCK_COMMENTS);
    pages.managersDecisionFormPage.commentsInputInternal().type(MOCK_INTERNAL_COMMENTS);

    pages.managersDecisionFormPage.submitButton().click();
    cy.url().should('eq', relative(`/case/${dealId}/underwriting/managers-decision/submitted`));

    // assert values are displayed
    pages.managersDecisionPage.decisionStatusTag().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Approved with conditions');
    });

    pages.managersDecisionPage.decisionMadeBy().invoke('text').then((text) => {
      const { firstName, lastName } = underWritingManager;
      const userFullName = `${firstName} ${lastName}`;

      expect(text.trim()).to.equal(userFullName);
    });

    pages.managersDecisionPage.decisionDateTime().invoke('text').then((text) => {
      const todayFormatted = moment().format('D MMMM YYYY');

      expect(text.trim()).contains(todayFormatted);
    });

    pages.managersDecisionPage.conditions().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_COMMENTS);
    });

    pages.managersDecisionPage.internalComments().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_INTERNAL_COMMENTS);
    });
  });

  describe('after valid form submit', () => {
    // NOTE: previous specs have already submitted decision
    it('Clicking `managers decision` navigation link goes to the submitted decision page', () => {
      // go back to main deal page
      cy.visit(relative(`/case/${dealId}/deal`));

      // click on underwriting and managers decision link
      partials.caseSubNavigation.underwritingLink().click();
      partials.underwritingSubNav.underwriterManagerDecisionLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/underwriting/managers-decision/submitted`));
    });

    it('Manually navigating to the managers-decision page redirects to the submitted values page ', () => {
      // go back to main deal page
      cy.visit(relative(`/case/${dealId}/deal`));

      // try to manually visit decision form page
      cy.visit(relative(`/case/${dealId}/underwriting/managers-decision`));

      // should be redirected
      cy.url().should('eq', relative(`/case/${dealId}/underwriting/managers-decision/submitted`));
    });
  });
});
