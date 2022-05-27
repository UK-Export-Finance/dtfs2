import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, T1_USER_1, UNDERWRITER_MANAGER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import pages from '../../../pages';

context('Amendments underwriting - add lead underwriter', () => {
  describe('Amendments add lead underwriter', () => {
    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, [mockFacilities[0]], MOCK_MAKER_TFM).then((createdFacilities) => {
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

    it('should submit an amendment request', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
      amendmentsPage.addAmendmentButton().click();
      cy.url().should('contain', 'request-date');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'request-approval');
      // manual approval
      amendmentsPage.amendmentRequestApprovalYes().click();
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update both the cover end date and the facility value
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      amendmentsPage.amendmentFacilityValueCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');

      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'facility-value');
      amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
      amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');
      amendmentsPage.continueAmendment().click();
    });

    it('should take you to assign amendment underwriter page as underwriter manager when adding a lead underwriter', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      const { _id } = dealFacilities[0];

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().contains('Add underwriter');

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().click({ force: true });

      cy.url().should('contain', `case/${dealId}/facility/${_id}/amendment`);
      cy.url().should('contain', '/lead-underwriter');

      pages.amendmentsPage.leadUnderwriterHeading().contains('Assign a lead underwriter');
      pages.amendmentsPage.assignedToSelectInput();
      pages.amendmentsPage.assignedToSelectInputOption();
      pages.amendmentsPage.assignedToSelectInputSelectedOption();

      pages.amendmentsPage.underWritingSubmitButton();
      pages.amendmentsPage.underWritingCancelLink();
    });

    it('should still show add lead underwriter button if press cancel on assign page', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().contains('Add underwriter');

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().click({ force: true });

      pages.amendmentsPage.underWritingCancelLink().click();

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().contains('Add underwriter');
    });

    it('should show details of assigned lead underwriter details on assigning an underwriter and a change links which takes back to assign lead underwriter page', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().contains('Add underwriter');

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().click({ force: true });

      pages.amendmentsPage.underWritingSubmitButton(0).click();

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().should('not.exist');

      pages.underwritingPage.amendmentLeadUnderwriterEmail().contains(`${UNDERWRITER_MANAGER_1.email}`);
      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().contains('Change');

      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().click({ force: true });

      const { _id } = dealFacilities[0];

      cy.url().should('contain', `case/${dealId}/facility/${_id}/amendment`);
      cy.url().should('contain', '/lead-underwriter');
    });

    it('should not show change link when logged in as T1_USER or PIM user', () => {
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentLeadUnderwriterEmail().contains(`${UNDERWRITER_MANAGER_1.email}`);
      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().should('not.exist');

      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentLeadUnderwriterEmail().contains(`${UNDERWRITER_MANAGER_1.email}`);
      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().should('not.exist');
    });
  });
});
