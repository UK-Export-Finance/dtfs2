import relative from '../../../relativeURL';
import { cancelLink, continueButton } from '../../../partials';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { tomorrowDay } from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, T1_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import pages from '../../../pages';
import { commonTestUnderwriterTasksAssignedToUser } from '../../../common-tests/assessmentTasksAssignedTo';
import { TASKS } from '../../../../fixtures/constants';

context('Amendments underwriting - add lead underwriter', () => {
  describe('Amendments add lead underwriter', () => {
    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType, PIM_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
      dealFacilities.forEach((facility) => {
        cy.deleteFacility(facility._id, BANK1_MAKER1);
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

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

      cy.clickContinueButton();

      cy.url().should('contain', 'request-approval');
      // manual approval
      amendmentsPage.amendmentRequestApprovalYes().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update both the cover end date and the facility value
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      amendmentsPage.amendmentFacilityValueCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: tomorrowDay });

      cy.clickContinueButton();

      cy.url().should('contain', 'facility-value');
      amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
      cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');
      cy.clickContinueButton();
    });

    it('should take you to assign amendment underwriter page as underwriter manager when adding a lead underwriter', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      const { _id } = dealFacilities[0];

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().contains('Add underwriter');

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().click({ force: true });

      cy.url().should('contain', `case/${dealId}/facility/${_id}/amendment`);
      cy.url().should('contain', '/lead-underwriter');

      pages.amendmentsPage.leadUnderwriterHeading().contains('Assign a lead underwriter');
      pages.amendmentsPage.assignedToSelectInput();
      pages.amendmentsPage.assignedToSelectInputOption();
      pages.amendmentsPage.assignedToSelectInputSelectedOption();

      continueButton();
      cancelLink();
    });

    it('should still show add lead underwriter button if press cancel on assign page', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().contains('Add underwriter');

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().click({ force: true });

      cy.clickCancelLink();

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().contains('Add underwriter');
    });

    it('should show details of assigned lead underwriter details on assigning an underwriter and a change links which takes back to assign lead underwriter page', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().contains('Add underwriter');

      commonTestUnderwriterTasksAssignedToUser(dealId, TASKS.UNASSIGNED);

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().click({ force: true });

      // Assert url format for lead underwriter assignment/modification.
      cy.url().should('contain', `case/${dealId}/facility/${dealFacilities[0]._id}/amendment`);
      cy.url().should('contain', '/lead-underwriter');

      // Lead Underwriter will be assigned on save, because select input was auto selected to current user.
      cy.clickContinueButton();

      pages.underwritingPage.amendmentAddLeadUnderwriterLink().should('not.exist');

      // Assert active lead underwritter by fullname
      pages.underwritingPage.amendmentLeadUnderwriterFullName().contains(`${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`);
      // Assert active lead underwritter by email, even if all emails are identical.
      pages.underwritingPage.amendmentLeadUnderwriterEmail().contains(`${UNDERWRITER_MANAGER_1.email}`);

      commonTestUnderwriterTasksAssignedToUser(dealId, UNDERWRITER_MANAGER_1);
    });

    it('should not show change link when logged in as T1_USER or PIM user', () => {
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentLeadUnderwriterFullName().contains(`${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`);
      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().should('not.exist');

      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentLeadUnderwriterFullName().contains(`${UNDERWRITER_MANAGER_1.firstName} ${UNDERWRITER_MANAGER_1.lastName}`);
      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().should('not.exist');
    });

    it('should allow changing lead underwriter', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().contains('Change');
      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().click({ force: true });

      pages.underwritingPage.amendmentLeadUnderwriterSelectInput().select(`${UNDERWRITER_1.firstName} ${UNDERWRITER_1.lastName}`);

      cy.clickContinueButton();

      // Assert active lead underwritter, better to use name because all emails are same.
      pages.underwritingPage.amendmentLeadUnderwriterFullName().contains(`${UNDERWRITER_1.firstName} ${UNDERWRITER_1.lastName}`);

      commonTestUnderwriterTasksAssignedToUser(dealId, UNDERWRITER_1);
    });

    it('should allow unassigning lead underwriter', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().contains('Change');
      pages.underwritingPage.amendmentChangeLeadUnderwriterLink().click({ force: true });

      pages.underwritingPage.amendmentLeadUnderwriterSelectInput().select(TASKS.UNASSIGNED);

      cy.clickContinueButton();

      pages.underwritingPage.amendmentLeadUnderwriterFullName().should('not.exist');
      pages.underwritingPage.amendmentAddLeadUnderwriterLink().contains('Add underwriter');

      commonTestUnderwriterTasksAssignedToUser(dealId, TASKS.UNASSIGNED);
    });
  });
});
