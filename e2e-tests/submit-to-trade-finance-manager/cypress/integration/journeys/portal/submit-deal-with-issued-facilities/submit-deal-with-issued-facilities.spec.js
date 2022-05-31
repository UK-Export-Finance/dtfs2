import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import MOCK_DEAL_READY_TO_SUBMIT from './test-data/dealReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;
import { T1_USER_1, TFM_URL } from '../../../../../../e2e-fixtures';

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });
    });
  });

  beforeEach(() => {
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  it('Portal deal is submitted to UKEF, user views deal in TFM. Facilities display tenor (exposure period in months)', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    portalPages.contractReadyForReview.comments().type('go');
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
    // user can login to TFM and view the submitted deal
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(T1_USER_1);

    const tfmCaseDealPage = `${TFM_URL}/case/${dealId}/deal`;
    cy.forceVisit(tfmCaseDealPage);
    cy.url().should('eq', `${TFM_URL}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // bond facilities that are `issued` display tenor (exposure period in months)
    //---------------------------------------------------------------
    let facilityRow;

    const issuedBond = dealFacilities.find((facility) => facility.type === 'Bond' && facility.facilityStage === 'Issued');

    const issuedBondId = issuedBond._id;
    facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(issuedBondId);

    facilityRow.facilityId().click();

    cy.url().should('eq', `${TFM_URL}/case/${dealId}/facility/${issuedBondId}`);

    tfmPages.facilityPage
      .facilityTenor()
      .invoke('text')
      .then((text) => {
        // the actual month is generated dynamically via API.
        // 'months' is added to the mapping of the API result.
        // so safe to assert based on `months` appearing, rather than adding regex assertion.
        expect(text.trim()).to.contain('month');
      });

    //---------------------------------------------------------------
    // loan facilities that are `issued` (called `Unconditional` in loans),
    // display tenor (exposure period in months)
    //---------------------------------------------------------------
    cy.forceVisit(tfmCaseDealPage);

    const issuedLoan = dealFacilities.find((facility) => facility.type === 'Loan' && facility.facilityStage === 'Unconditional');

    const issuedLoanId = issuedLoan._id;
    facilityRow = tfmPages.caseDealPage.dealFacilitiesTable.row(issuedLoanId);

    facilityRow.facilityId().click();

    cy.url().should('eq', `${TFM_URL}/case/${dealId}/facility/${issuedLoanId}`);

    tfmPages.facilityPage
      .facilityTenor()
      .invoke('text')
      .then((text) => {
        // the actual month is generated dynamically via API.
        // 'months' is added to the mapping of the API result.
        // so safe to assert based on `months` appearing, rather than adding regex assertion.
        expect(text.trim()).to.contain('month');
      });
  });
});
