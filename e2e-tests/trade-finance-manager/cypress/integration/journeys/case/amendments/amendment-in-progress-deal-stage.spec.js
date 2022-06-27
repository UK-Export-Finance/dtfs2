import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import pages from '../../../pages';
import partials from '../../../partials';
import { TFM_DEAL_STAGE } from '../../../../../../e2e-fixtures/constants.fixture';

context('Amendments deal stage - amendment in progress', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0], mockFacilities[1]], MOCK_MAKER_TFM).then((createdFacilities) => {
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

  it('should show confirmed on deal stage as no amendment in progress', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.tasksLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    pages.tasksPage.filterRadioYourTeam().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    pages.tasksPage.filterRadioAllTasks().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    partials.caseSubNavigation.dealLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    partials.caseSubNavigation.partiesLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    partials.caseSubNavigation.documentsLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    partials.caseSubNavigation.activityLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    pages.activitiesPage.filterCommentsOnly().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);

    partials.caseSubNavigation.underwritingLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.CONFIRMED);
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

  it('should submit an second amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[1]._id;
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
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update the facility value
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();
  });

  it('should show amendment in progress on tasks page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.tasksLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    pages.tasksPage.filterRadioYourTeam().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    pages.tasksPage.filterRadioAllTasks().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on deal/facility page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.dealLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on parties page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.partiesLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on documents page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.documentsLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on activities page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.activityLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    pages.activitiesPage.filterCommentsOnly().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on underwriting page', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.underwritingLink().click();
    partials.caseSummary.ukefDealStage().contains(TFM_DEAL_STAGE.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });
});
