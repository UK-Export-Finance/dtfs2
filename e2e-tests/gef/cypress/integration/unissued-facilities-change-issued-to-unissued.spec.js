// TODO: DTFS2-5616

// import { format } from 'date-fns';

// import relative from './relativeURL';

// import CONSTANTS from '../fixtures/constants';

// import dateConstants from '../../../e2e-fixtures/dateConstants';

// import { MOCK_APPLICATION_AIN } from '../fixtures/mocks/mock-deals';
// import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
// import {
//   MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE,
// } from '../fixtures/mocks/mock-facilities';
// import applicationPreview from './pages/application-preview';
// import unissuedFacilityTable from './pages/unissued-facilities';
// import aboutFacilityUnissued from './pages/unissued-facilities-about-facility';
// import CREDENTIALS from '../fixtures/credentials.json';
// import statusBanner from './pages/application-status-banner';
// import facilities from './pages/facilities';

// let dealId;
// let token;
// let facilityOneId;

// const unissuedFacilitiesArray = [
//   MOCK_FACILITY_ONE,
//   MOCK_FACILITY_THREE,
// ];

context('Change issued facilities back to unissued (changed to issued facilities post submission)', () => {
  // before(() => {
  //   cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
  //     token = t;
  //   }).then(() => {
  //     // creates application and inserts facilities and changes status
  //     cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
  //       dealId = body._id;
  //       cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN).then(() => {
  //         cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
  //           facilityOneId = facility.body.details._id;
  //           cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE);
  //         });
  //         cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
  //           cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO));
  //         cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
  //           cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_THREE));
  //         cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
  //       });
  //     });
  //   });
  // });

  describe('Change facility to issued from unissued table', () => {
  //   beforeEach(() => {
  //     Cypress.Cookies.preserveOnce('connect.sid');
  //     cy.login(CREDENTIALS.MAKER);
  //     cy.visit(relative(`/gef/application-details/${dealId}`));
  //   });

    //   // ensures the task comment box exists with correct headers and link
    it('task comment box exists with correct header and unissued facilities link', () => {
      // applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      // applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      // applicationPreview.submitButtonPostApproval().should('not.exist');
      // applicationPreview.mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      // applicationPreview.automaticCoverSummaryList().contains('Yes - submit as an automatic inclusion notice');
      // applicationPreview.automaticCoverCriteria().should('exist');
    });

    //   /* application preview should not have unlocked ability to change unissued facilities until
    //      at least 1 changed from unissued table
    //   */
    //   it('facilities table does not contain any add or change links as have not changed any facilities to issued yet', () => {
    //     applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_THREE.name);
    //     applicationPreview.facilitySummaryListRowAction(0, 0).should('not.exist');

    //     applicationPreview.facilitySummaryListRowAction(0, 1).should('not.exist');

    //     applicationPreview.facilitySummaryListRowAction(0, 2).should('not.exist');

    //     applicationPreview.facilitySummaryListRowKey(0, 3).should('not.have.value', 'Date issued to exporter');

    //     applicationPreview.facilitySummaryListRowAction(0, 3).should('not.exist');
    //   });

    //   it('clicking unissued facilities link takes you to unissued facility list page', () => {
    //     applicationPreview.unissuedFacilitiesReviewLink().click();
    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
    //     unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');
    //     unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
    //     unissuedFacilityTable.rows().contains(format(dateConstants.threeDaysAgoPlusMonth, 'dd MMM yyyy'));
    //     statusBanner.applicationBanner().should('exist');
    //   });

    //   // clicking update on unissued-facilities table
    //   it('clicking on update should take you to the update facility page with correct url', () => {
    //     applicationPreview.unissuedFacilitiesReviewLink().click();
    //     unissuedFacilityTable.updateIndividualFacilityButton(0).click();
    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`));
    //   });

    //   it('the correct success messages should be displayed after changing facility to issued', () => {
    //     applicationPreview.unissuedFacilitiesReviewLink().click();
    //     unissuedFacilityTable.updateIndividualFacilityButton(0).click();

    //     aboutFacilityUnissued.issueDateDay().type(dateConstants.threeDaysDay);
    //     aboutFacilityUnissued.issueDateMonth().type(dateConstants.threeDaysMonth);
    //     aboutFacilityUnissued.issueDateYear().type(dateConstants.threeDaysYear);

    //     aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
    //     aboutFacilityUnissued.coverStartDateDay().type(dateConstants.threeDaysDay);
    //     aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.threeDaysMonth);
    //     aboutFacilityUnissued.coverStartDateYear().type(dateConstants.threeDaysYear);

    //     aboutFacilityUnissued.coverEndDateDay().type(dateConstants.threeMonthsOneDayDay);
    //     aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.threeMonthsOneDayMonth);
    //     aboutFacilityUnissued.coverEndDateYear().type(dateConstants.threeMonthsOneDayYear);
    //     aboutFacilityUnissued.continueButton().click();

    //     unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[0].name} is updated`);
    //     // checks the facility has been removed from unissued list
    //     unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
    //     // should not be able to continue until all facilities issued - instead use update later to go to preview
    //     unissuedFacilityTable.continueButton().should('not.exist');

    //     unissuedFacilityTable.updateIndividualFacilityButton(0).click();
    //     aboutFacilityUnissued.issueDateDay().type(dateConstants.todayDay);
    //     aboutFacilityUnissued.issueDateMonth().type(dateConstants.todayMonth);
    //     aboutFacilityUnissued.issueDateYear().type(dateConstants.todayYear);

    //     aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
    //     aboutFacilityUnissued.coverStartDateDay().type(dateConstants.twoMonthsDay);
    //     aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.twoMonthsMonth);
    //     aboutFacilityUnissued.coverStartDateYear().type(dateConstants.twoMonthsYear);
    //     aboutFacilityUnissued.coverEndDateDay().type(dateConstants.threeMonthsOneDayDay);
    //     aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.threeMonthsOneDayMonth);
    //     aboutFacilityUnissued.coverEndDateYear().type(dateConstants.threeMonthsOneDayYear);
    //     aboutFacilityUnissued.continueButton().click();

    //     unissuedFacilityTable.rows().should('have.length', 0);
    //     unissuedFacilityTable.allUnissuedUpdatedSuccess().contains('Facility stages are now updated');
    //     unissuedFacilityTable.continueButton().should('exist');
    //     // exists since all unissued updated from table
    //     unissuedFacilityTable.continueButton().click();
    //   });

    //   // task comments box should show facilities names have changed to unissued
    //   it('preview review facility stage has correct headers and shows all 2 updated facilities and submit button should be visible', () => {
    //     applicationPreview.reviewFacilityStage().contains('Review facility stage');
    //     applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
    //     applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
    //     applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
    //     applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
    //     applicationPreview.submitButtonPostApproval().should('exist');
    //   });

    //   /* should be able to change dates and unissue on facility that has changed to issued */
    //   it('facility table should have change links on the changed to issued facilities', () => {
    //     // to check date format
    //     const issuedDate = format(dateConstants.today, 'd MMMM yyyy');
    //     const coverStart = format(dateConstants.twoMonths, 'd MMMM yyyy');
    //     const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');

    //     // should be able to change facility three as changed to issued
    //     applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_THREE.name);
    //     applicationPreview.facilitySummaryListRowAction(0, 0).contains('Change');
    //     applicationPreview.facilitySummaryListRowAction(0, 1).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowValue(0, 2).contains('Issued');
    //     applicationPreview.facilitySummaryListRowAction(0, 2).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(0, 3).contains(issuedDate);
    //     applicationPreview.facilitySummaryListRowAction(0, 3).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(0, 4).contains(coverStart);
    //     applicationPreview.facilitySummaryListRowAction(0, 4).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(0, 5).contains(coverEnd);
    //     applicationPreview.facilitySummaryListRowAction(0, 5).contains('Change');

    //     // should not be able to change facility two has previously issued (not changed from unissued to issued)
    //     applicationPreview.facilitySummaryListRowValue(1, 0).contains(MOCK_FACILITY_TWO.name);
    //     applicationPreview.facilitySummaryListRowAction(1, 0).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(1, 1).should('not.exist');
    //     applicationPreview.facilitySummaryListRowValue(1, 2).contains('Issued');
    //     applicationPreview.facilitySummaryListRowAction(1, 2).should('not.exist');
    //     applicationPreview.facilitySummaryListRowKey(1, 3).should('not.have.value', 'Date issued to exporter');
    //     applicationPreview.facilitySummaryListRowValue(1, 3).contains('Date you submit the notice');
    //     applicationPreview.facilitySummaryListRowAction(1, 3).should('not.exist');
    //   });

    //   // checks that can unissue a changed to issued facility
    //   it('clicking change on issued should take you to hasBeenIssued page with different url', () => {
    //     // should be able to change number 1 as changed to issued
    //     applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_ONE.name);
    //     applicationPreview.facilitySummaryListRowAction(2, 2).click();

    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

    //     facilities.hasBeenIssuedHeading().contains('Has your bank already issued this cash facility to the exporter?');
    //     facilities.hasBeenIssuedRadioYesRadioButton().should('exist');
    //     // check that this box is checked (as already issued)
    //     facilities.hasBeenIssuedRadioYesRadioButton().invoke('attr', 'value').then((value) => {
    //       expect(value).to.equal('true');
    //     });

    //     facilities.hasBeenIssuedRadioNoRadioButton().invoke('attr', 'value').then((value) => {
    //       expect(value).to.equal('false');
    //     });
    //     facilities.continueButton().should('exist');
    //     facilities.backLink().should('exist');
    //     facilities.cancelLink().should('exist');
    //     facilities.headingCaption().should('not.exist');
    //   });

    //   it('pressing back, cancel or yes should not edit the facility and take you back to details page', () => {
    //     const issuedDate = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');
    //     const coverStart = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');
    //     const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');
    //     // should be able to change number 1 as changed to issued
    //     applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_ONE.name);
    //     applicationPreview.facilitySummaryListRowAction(2, 2).click();

    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

    //     facilities.backLink().click();
    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    //     applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_ONE.name);
    //     applicationPreview.facilitySummaryListRowAction(2, 0).contains('Change');
    //     applicationPreview.facilitySummaryListRowAction(2, 1).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowValue(2, 2).contains('Issued');
    //     applicationPreview.facilitySummaryListRowAction(2, 2).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 3).contains(issuedDate);
    //     applicationPreview.facilitySummaryListRowAction(2, 3).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 4).contains(coverStart);
    //     applicationPreview.facilitySummaryListRowAction(2, 4).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 5).contains(coverEnd);
    //     applicationPreview.facilitySummaryListRowAction(2, 5).contains('Change');

    //     applicationPreview.facilitySummaryListRowAction(2, 2).click();
    //     facilities.cancelLink().click();
    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    //     applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_ONE.name);
    //     applicationPreview.facilitySummaryListRowAction(2, 0).contains('Change');
    //     applicationPreview.facilitySummaryListRowAction(2, 1).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowValue(2, 2).contains('Issued');
    //     applicationPreview.facilitySummaryListRowAction(2, 2).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 3).contains(issuedDate);
    //     applicationPreview.facilitySummaryListRowAction(2, 3).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 4).contains(coverStart);
    //     applicationPreview.facilitySummaryListRowAction(2, 4).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 5).contains(coverEnd);
    //     applicationPreview.facilitySummaryListRowAction(2, 5).contains('Change');

    //     applicationPreview.facilitySummaryListRowAction(2, 2).click();
    //     facilities.continueButton().click();
    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    //     applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_ONE.name);
    //     applicationPreview.facilitySummaryListRowAction(2, 0).contains('Change');
    //     applicationPreview.facilitySummaryListRowAction(2, 1).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowValue(2, 2).contains('Issued');
    //     applicationPreview.facilitySummaryListRowAction(2, 2).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 3).contains(issuedDate);
    //     applicationPreview.facilitySummaryListRowAction(2, 3).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 4).contains(coverStart);
    //     applicationPreview.facilitySummaryListRowAction(2, 4).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 5).contains(coverEnd);
    //     applicationPreview.facilitySummaryListRowAction(2, 5).contains('Change');
    //   });

    //   it('changing the facility to unissued should remove it from the list of issued facilities and remove dates', () => {
    //     // should be able to change number 1 as changed to issued
    //     applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_ONE.name);
    //     applicationPreview.facilitySummaryListRowAction(2, 2).click();

    //     cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

    //     facilities.hasBeenIssuedRadioNoRadioButton().click();
    //     facilities.continueButton().click();

    //     applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_ONE.name);
    //     applicationPreview.facilitySummaryListRowAction(2, 0).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowAction(2, 1).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowValue(2, 2).contains('Unissued');
    //     applicationPreview.facilitySummaryListRowAction(2, 2).contains('Change');
    //     applicationPreview.facilitySummaryListRowValue(2, 3).contains(MOCK_FACILITY_ONE.monthsOfCover);
    //     applicationPreview.facilitySummaryListRowAction(2, 3).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowAction(2, 4).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowAction(2, 5).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowAction(2, 6).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowAction(2, 7).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowAction(2, 8).should('have.value', '');
    //     applicationPreview.facilitySummaryListRowAction(2, 9).should('have.value', '');
    //     // check that these should not exist as should be removed
    //     applicationPreview.facilitySummaryListRowKey(2, 3).should('not.contain', 'Date issued to exporter');
    //     applicationPreview.facilitySummaryListRowKey(2, 4).should('not.contain', 'Cover start date');
    //     applicationPreview.facilitySummaryListRowKey(2, 5).should('not.contain', 'Cover end date');

    //     applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
    //     applicationPreview.updatedUnissuedFacilitiesList().should('not.contain', unissuedFacilitiesArray[0].name);
    //     applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
    //     applicationPreview.submitButtonPostApproval().should('exist');
    //   });

    //   it('changing all facilities to unissued takes you back to initial view unissued facilities page', () => {
    //     applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_THREE.name);
    //     applicationPreview.facilitySummaryListRowAction(0, 2).click();

    //     facilities.hasBeenIssuedRadioNoRadioButton().click();
    //     facilities.continueButton().click();

    //     applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_THREE.name);
    //     applicationPreview.facilitySummaryListRowAction(0, 0).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(0, 1).should('not.exist');
    //     applicationPreview.facilitySummaryListRowValue(0, 2).contains('Unissued');
    //     applicationPreview.facilitySummaryListRowAction(0, 2).should('not.exist');
    //     applicationPreview.facilitySummaryListRowValue(0, 3).contains(MOCK_FACILITY_THREE.monthsOfCover);
    //     applicationPreview.facilitySummaryListRowAction(0, 3).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(0, 4).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(0, 5).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(0, 6).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(0, 7).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(0, 8).should('not.exist');
    //     applicationPreview.facilitySummaryListRowAction(0, 9).should('not.exist');

  //     applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
  //     applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
  //     applicationPreview.submitButtonPostApproval().should('not.exist');
  //   });
  });
});
