import relative from '../../../../../relativeURL';
import portalPages from '../../../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../../../tfm/cypress/e2e/pages';
import {
  COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE,
  fillAndSubmitIssueBondFacilityForm,
} from '../../../../../../../../portal/cypress/e2e/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm';

import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import MOCK_DEAL_UNISSUED_BOND_READY_TO_SUBMIT from './test-data/dealWithUnissuedBondReadyToSubmit';

import { BUSINESS_SUPPORT_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  let bond;
  let bondId;

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_UNISSUED_BOND_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
        [bond] = createdFacilities;
        bondId = bond._id;
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.saveSession();
  });

  after(() => {
    cy.clearSessionCookies();
  });

  it('Portal deal with unissued bond is submitted to UKEF, bond displays correctly in TFM with Premium schedule populated. Bond is then issued in Portal and resubmitted; displays correctly in TFM, Portal facility status is updated to `Acknowledged`', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
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
    // TFM bond values should render in an unissued state
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(BUSINESS_SUPPORT_USER_1);

    let tfmFacilityPage = `${TFM_URL}/case/${dealId}/facility/${bondId}`;
    cy.forceVisit(tfmFacilityPage);

    cy.assertText(tfmPages.facilityPage.facilityStage(), 'Commitment');

    cy.assertText(tfmPages.facilityPage.facilityBankIssueNoticeReceived(), '-');

    cy.assertText(tfmPages.facilityPage.facilityCoverStartDate(), '-');

    cy.assertText(tfmPages.facilityPage.facilityCoverEndDate(), '-');

    cy.assertText(tfmPages.facilityPage.facilityTenor(), `${bond.ukefGuaranteeInMonths} months`);

    //---------------------------------------------------------------
    // portal maker completes bond insurance form
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    const bondRow = portalPages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();

    //---------------------------------------------------------------
    // portal maker submits deal to checker
    //---------------------------------------------------------------
    portalPages.contract.proceedToReview().click();

    cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'Issued');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

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
    // TFM bond values should be updated
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);
    cy.tfmLogin(BUSINESS_SUPPORT_USER_1);

    tfmFacilityPage = `${TFM_URL}/case/${dealId}/facility/${bondId}`;
    cy.forceVisit(tfmFacilityPage);

    cy.assertText(tfmPages.facilityPage.facilityStage(), 'Issued');

    cy.assertText(
      tfmPages.facilityPage.facilityBankIssueNoticeReceived(),
      // the code actually uses facility.submittedAsIssuedDate,
      // but in this e2e test it will always be today so to simplify..
      new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }),
    );

    const expectedCoverStartDate = new Date(COVER_START_DATE_VALUE).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    cy.assertText(tfmPages.facilityPage.facilityCoverStartDate(), expectedCoverStartDate);

    const expectedCoverEndDate = new Date(COVER_END_DATE_VALUE).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    cy.assertText(tfmPages.facilityPage.facilityCoverEndDate(), expectedCoverEndDate);

    tfmPages.facilityPage
      .facilityTenor()
      .invoke('text')
      .then((text) => {
        // the actual month is generated dynamically via API.
        // 'months' is added to the mapping of the API result.
        // so safe to assert based on `months` appearing, rather than adding regex assertion.
        expect(text.trim()).not.to.contain(bond.ukefGuaranteeInMonths);
        expect(text.trim()).to.contain('month');
      });

    //---------------------------------------------------------------
    // TFM bond should have Premium schedule populated
    //---------------------------------------------------------------
    tfmPages.facilityPage.facilityTabPremiumSchedule().click();

    tfmPages.facilityPage.premiumScheduleTable.total().should('be.visible');

    tfmPages.facilityPage.premiumScheduleTable
      .total()
      .invoke('text')
      .then((text) => {
        // total is calculated dynamically so we can only assert the `Total` text.
        // this text is only displayed if a total exists.
        expect(text.trim()).to.contain('Total');
      });

    //---------------------------------------------------------------
    // portal bond status should be updated to `Acknowledged`
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);

    cy.assertText(bondRow.bondStatus(), 'Acknowledged');

    //---------------------------------------------------------------
    // portal deal status should be updated to `Acknowledged`
    //---------------------------------------------------------------
    cy.assertText(portalPages.contract.previousStatus(), 'Submitted');

    cy.assertText(portalPages.contract.status(), 'Acknowledged');
  });
});
