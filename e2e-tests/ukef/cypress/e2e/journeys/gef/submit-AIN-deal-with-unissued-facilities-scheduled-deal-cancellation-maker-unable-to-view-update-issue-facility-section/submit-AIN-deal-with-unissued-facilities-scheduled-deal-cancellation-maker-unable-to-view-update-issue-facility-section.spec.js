import relative from '../../../relativeURL';
import gefPages from '../../../../../../gef/cypress/e2e/pages';
import { submitButton } from '../../../../../../gef/cypress/e2e/partials';
import tfmPages from '../../../../../../tfm/cypress/e2e/pages';
import tfmPartials from '../../../../../../tfm/cypress/e2e/partials';
import MOCK_USERS from '../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anUnissuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../e2e-fixtures';
import { tomorrow } from '../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let dealId;
  let deal;
  const dealFacilities = [];

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      deal = insertedDeal;
      // updates a gef deal so has relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [anUnissuedCashFacility()], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(createdFacilities.details);
      });
    });
  });

  beforeEach(() => {
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  it('Gef AIN deal with unissued facilities is submitted to UKEF, user cancel deal in TFM. Maker unable to view update issue facility section on portal', () => {
    //---------------------------------------------------------------
    // portal maker submits gef deal for review
    //---------------------------------------------------------------

    cy.login(BANK1_MAKER1);
    gefPages.applicationDetails.visit(deal);
    submitButton().click();
    cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
    cy.keyboardInput(gefPages.applicationSubmission.commentsField(), 'go');
    submitButton().click();

    //---------------------------------------------------------------
    // portal checker submits gef deal to ukef
    //---------------------------------------------------------------

    cy.login(BANK1_CHECKER1);
    gefPages.applicationDetails.visit(deal);
    submitButton().click();
    gefPages.applicationSubmission.confirmSubmissionCheckbox().check();
    submitButton().click();

    // expect to land on the /submit-to-ukef with a success message
    cy.url().should('include', '/submit-to-ukef');

    //---------------------------------------------------------------
    // user login to TFM and schedule a cancellation gef deal for tomorrow
    //----------------------------------------------------------------

    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.forceVisit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);
    cy.forceVisit(`${TFM_URL}/case/${dealId}/deal`);
    tfmPages.caseDealPage.cancelDealButton().click();
    cy.keyboardInput(tfmPages.reasonForCancellingPage.reasonForCancellingTextBox(), 'cancel');
    tfmPartials.continueButton().click();
    cy.url().should('include', '/bank-request-date');
    cy.completeDateFormFields({ idPrefix: 'bank-request-date' });
    tfmPartials.continueButton().click();

    cy.url().should('include', '/effective-from-date');
    cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: tomorrow.date });
    tfmPartials.continueButton().click();

    cy.url().should('include', '/check-details');
    tfmPages.checkDetails.dealDeletionButton().click();

    cy.url().should('include', '/deal');
    tfmPartials.successBanner().should('exist');
    tfmPartials
      .successBanner()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain('scheduled for cancellation');
      });

    //-----------------------------------------------------------------------
    // user login to portal and unable to view update issue facility section
    //-----------------------------------------------------------------------

    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.login(BANK1_MAKER1);
    gefPages.applicationDetails.visit(deal);
    gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
  });
});
