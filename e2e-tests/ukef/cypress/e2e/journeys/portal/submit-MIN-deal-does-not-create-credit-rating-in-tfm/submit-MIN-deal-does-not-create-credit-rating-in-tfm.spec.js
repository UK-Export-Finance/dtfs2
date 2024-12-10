import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../tfm/cypress/e2e/pages';

import MOCK_USERS from '../../../../../../e2e-fixtures/portal-users.fixture';
import { BUSINESS_SUPPORT_USER_1, TFM_URL } from '../../../../../../e2e-fixtures';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/MIN-deal/dealReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1)
      .then((insertedDeals) => {
        [deal] = insertedDeals;
        dealId = deal._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1)
          .then((createdFacilities) => {
            dealFacilities.push(...createdFacilities);
          })
          .then(() => {
            cy.wrap(dealFacilities).should('not.be.empty');
          });
      })
      .then(() => {
        cy.wrap(deal).should('not.be.empty');
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

  it('Portal MIN deal is submitted to UKEF, `Not set` credit rating displays in TFM facilities', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // user login to TFM
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(BUSINESS_SUPPORT_USER_1);

    const facilityId = dealFacilities[0]._id;
    const tfmFacilityPage = `${TFM_URL}/case/${dealId}/facility/${facilityId}`;
    cy.forceVisit(tfmFacilityPage);

    tfmPages.facilityPage.facilityDealCreditRating().should('not.exist');

    tfmPages.facilityPage.facilityDealCreditRatingNotSet().should('be.visible');
  });
});
