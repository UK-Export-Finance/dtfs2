import relative from '../../relativeURL';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';
import pages from '../../pages';
import partials from '../../partials';
import { DEAL_STAGE_TFM } from '../../../fixtures/constants';

context('Amendments deal stage - amendment in progress and in progress amendment bar', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
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

  it('should show confirmed on deal stage as no amendment in progress and no amendment in progress bar', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.tasksLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    pages.tasksPage.filterRadioYourTeam().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    pages.tasksPage.filterRadioAllTasks().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    partials.caseSubNavigation.dealLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    partials.caseSubNavigation.partiesLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    partials.caseSubNavigation.documentsLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    partials.caseSubNavigation.activityLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    pages.activitiesPage.filterCommentsOnly().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');

    partials.caseSubNavigation.underwritingLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.CONFIRMED);
    amendmentsPage.amendmentInProgressBar().should('not.exist');
    amendmentsPage.amendmentInProgressBarLink().should('not.exist');
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

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
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
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update the facility value
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should show amendment in progress on tasks page and show amendment in progress bar', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.tasksLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    pages.tasksPage.filterRadioYourTeam().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    pages.tasksPage.filterRadioAllTasks().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on deal/facility page and show amendment in progress bar', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.dealLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on parties page and show amendment in progress bar', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.partiesLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on documents page and show amendment in progress bar', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.documentsLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on activities page and show amendment in progress bar', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.activityLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);

    pages.activitiesPage.filterCommentsOnly().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });

  it('should show amendment in progress on underwriting page and show amendment in progress bar', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    partials.caseSubNavigation.underwritingLink().click();
    partials.caseSummary.ukefDealStage().contains(DEAL_STAGE_TFM.AMENDMENT_IN_PROGRESS);
    amendmentsPage.amendmentInProgressBar().contains('Amendment in progress for');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[0].ukefFacilityId}`);
    amendmentsPage.amendmentInProgressBar().contains(',');
    amendmentsPage.amendmentInProgressBarLink().contains(`facility ${dealFacilities[1].ukefFacilityId}`);
  });
});
