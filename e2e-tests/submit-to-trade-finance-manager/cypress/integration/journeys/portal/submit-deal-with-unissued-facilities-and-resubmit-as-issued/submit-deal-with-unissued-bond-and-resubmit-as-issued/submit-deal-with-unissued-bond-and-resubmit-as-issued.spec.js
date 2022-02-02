import relative from '../../../../relativeURL';
import portalPages from '../../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../../trade-finance-manager/cypress/integration/pages';
import {
  COVER_START_DATE_VALUE,
  COVER_END_DATE_VALUE,
  fillAndSubmitIssueBondFacilityForm,
} from '../../../../../../../portal/cypress/integration/journeys/maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm';

import MOCK_USERS from '../../../../../../../portal/cypress/fixtures/users';
import MOCK_DEAL_UNISSUED_BOND_READY_TO_SUBMIT from './test-data/dealWithUnissuedBondReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

// Cypress.config('tfmUrl') returns incorrect url...
const tfmRootUrl = 'http://localhost:5003';

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  let bond;
  let bondId;

  before(() => {
    cy.insertManyDeals([
      MOCK_DEAL_UNISSUED_BOND_READY_TO_SUBMIT(),
    ], BANK1_MAKER1)
      .then((insertedDeals) => {
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

  it('Portal deal with unissued bond is submitted to UKEF, bond displays correctly in TFM with Premium schedule populated. Bond is then issued in Portal and resubmitted; displays correctly in TFM, Portal facility status is updated to `Acknowledged`', () => {
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
    // TFM bond values should render in an unissued state
    //---------------------------------------------------------------

    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('BUSINESS_SUPPORT_USER_1');
    tfmPages.landingPage.submitButton().click();

    let tfmFacilityPage = `${tfmRootUrl}/case/${dealId}/facility/${bondId}`;
    cy.forceVisit(tfmFacilityPage);

    tfmPages.facilityPage.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Commitment');
    });

    tfmPages.facilityPage.facilityBankIssueNoticeReceived().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      expect(text.trim()).to.equal('-');
    });

    tfmPages.facilityPage.facilityTenor().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${bond.ukefGuaranteeInMonths} months`);
    });


    //---------------------------------------------------------------
    // portal maker completes bond inssuance form
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    const bondRow = portalPages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityForm();


    //---------------------------------------------------------------
    // portal maker submits deal to checker
    //---------------------------------------------------------------
    portalPages.contract.proceedToReview().click();

    portalPages.contractReadyForReview.comments().type('Issued');
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
    cy.forceVisit(tfmRootUrl);
    tfmPages.landingPage.email().type('BUSINESS_SUPPORT_USER_1');
    tfmPages.landingPage.submitButton().click();

    tfmFacilityPage = `${tfmRootUrl}/case/${dealId}/facility/${bondId}`;
    cy.forceVisit(tfmFacilityPage);

    tfmPages.facilityPage.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issued');
    });

    tfmPages.facilityPage.facilityBankIssueNoticeReceived().invoke('text').then((text) => {
      // the code actually uses facility.submittedAsIssuedDate,
      // but in this e2e test it will always be today so to simplify..
      const expectedDate = new Date().toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverStartDate().invoke('text').then((text) => {
      const expectedDate = new Date(COVER_START_DATE_VALUE).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityCoverEndDate().invoke('text').then((text) => {
      const expectedDate = new Date(COVER_END_DATE_VALUE).toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      expect(text.trim()).to.equal(expectedDate);
    });

    tfmPages.facilityPage.facilityTenor().invoke('text').then((text) => {
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

    tfmPages.facilityPage.premiumScheduleTable.total().invoke('text').then((text) => {
      // total is calculated dynamically so we can only assert the `Total` text.
      // this text is only displayed if a total exists.
      expect(text.trim()).to.contain('Total');
    });


    //---------------------------------------------------------------
    // portal bond status should be updated to `Acknowledged by UKEF`
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });

    //---------------------------------------------------------------
    // portal deal status should be updated to `Acknowledged by UKEF`
    //---------------------------------------------------------------
    portalPages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });
  });
});

/* eslint-enable no-underscore-dangle */
