import relative from '../../relativeURL';
import { caseSubNavigation } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';
import pages from '../../pages';
import { DISPLAY_USER_TEAMS } from '../../../fixtures/constants';

context('Amendments tasks - automatic amendment tasks', () => {
  let dealId;
  let userId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, PIM_USER_1);

      cy.getUser(PIM_USER_1.username, UNDERWRITER_MANAGER_1).then((userObj) => {
        userId = userObj._id;
      });
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should submit an automatic amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    cy.keyboardInput(amendmentsPage.amendmentRequestDayInput(), dateConstants.todayDay);
    cy.keyboardInput(amendmentsPage.amendmentRequestMonthInput(), dateConstants.todayMonth);
    cy.keyboardInput(amendmentsPage.amendmentRequestYearInput(), dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    // automatic approval
    amendmentsPage.amendmentRequestApprovalNo().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-effective-date');

    cy.keyboardInput(amendmentsPage.amendmentEffectiveDayInput(), dateConstants.todayDay);
    cy.keyboardInput(amendmentsPage.amendmentEffectiveMonthInput(), dateConstants.todayMonth);
    cy.keyboardInput(amendmentsPage.amendmentEffectiveYearInput(), dateConstants.todayYear);
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

    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateDayInput(), dateConstants.tomorrowDay);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateMonthInput(), dateConstants.todayMonth);
    cy.keyboardInput(amendmentsPage.amendmentCoverEndDateYearInput(), dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should open task links with correct amendment tasks with correct status and titles', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.taskTypeHeading().contains('Amendment for facility');
    pages.tasksPage.taskGroupHeading().contains('Set up amendment');
    pages.tasksPage.taskGroupHeading().should('not.contain', 'Underwrite amendment');
    pages.tasksPage.taskGroupHeading().should('not.contain', 'Amendment approvals');

    pages.tasksPage.tasks.row(1, 1).link().contains('File all emails about this amendment request');
    pages.tasksPage.tasks.row(1, 1).assignedTo().contains('Unassigned');
    pages.tasksPage.tasks.row(1, 1).team().contains(DISPLAY_USER_TEAMS.PIM);
    pages.tasksPage.tasks.row(1, 1).dateStarted().contains('-');
    pages.tasksPage.tasks.row(1, 1).dateCompleted().contains('-');
    pages.tasksPage.tasks.row(1, 1).status().contains('To do');
  });

  it('should not allow you to assign, change the status to in progress and done if user in wrong group', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 1).link().should('not.exist');
  });

  it('should allow you to assign, change the status to in progress and done', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 1).link().first().click();

    cy.url().should('contain', '/amendment');
    cy.url().should('contain', `task/${1}/group/${1}`);

    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputInProgress().click();
    cy.clickSubmitButton();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 1).assignedTo().first().contains(`${PIM_USER_1.firstName} ${PIM_USER_1.lastName}`);
    pages.tasksPage.tasks.row(1, 1).status().contains('In progress');

    pages.tasksPage.tasks.row(1, 1).link().first().click();
    cy.url().should('contain', '/amendment');
    cy.url().should('contain', `task/${1}/group/${1}`);
    pages.taskPage.taskStatusRadioInputDone().click();
    cy.clickSubmitButton();
    pages.tasksPage.tasks.row(1, 1).status().contains('Done');
  });
});
