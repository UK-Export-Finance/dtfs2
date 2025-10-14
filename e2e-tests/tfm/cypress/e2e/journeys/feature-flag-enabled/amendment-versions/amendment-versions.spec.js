import { getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { MOCK_DEAL_AIN } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import { caseSubNavigation, caseSummary } from '../../../partials';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import pages from '../../../pages';

context('Amendment versions - amendments should have correct versions when completing tasks on older amendments', () => {
  let dealId;
  let userId;
  let facilityId;
  let ukefFacilityId;
  const dealFacilities = [];

  const amendment1Value = '123';
  const amendment2Value = '1234';
  const amendment3Value = '12345';

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
        ukefFacilityId = createdFacilities[0].ukefFacilityId;

        cy.submitDeal(dealId, dealType, PIM_USER_1);

        cy.getUser(PIM_USER_1.username, UNDERWRITER_MANAGER_1).then((userObj) => {
          userId = userObj._id;

          cy.login(PIM_USER_1);
          facilityId = dealFacilities[0]._id;
          cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

          facilityPage.facilityTabAmendments().click();

          // complete 1st and 2nd amendments
          cy.completeValueTFMAmendment({ value: amendment1Value });
          cy.completeValueTFMAmendment({ value: amendment2Value, existingValue: amendment1Value });

          // complete task for amendment 1
          caseSubNavigation.tasksLink().click();
          cy.url().should('eq', relative(`/case/${dealId}/tasks`));
          pages.tasksPage.filterRadioAllTasks().click();

          pages.tasksPage.tasks.row(1, 1).link().first().click();
          pages.taskPage.assignedToSelectInput().select(userId);
          pages.taskPage.taskStatusRadioInputDone().click();
          cy.clickSubmitButton();
          pages.tasksPage.tasks.row(1, 1).status().contains('Done');
        });
      });
    });
  });

  beforeEach(() => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should display the correct exposure and value on the facilities page and banner', () => {
    const value = getFormattedMonetaryValue(amendment2Value);
    const exposure = getFormattedMonetaryValue(Number(amendment2Value) * 0.2);

    cy.assertText(facilityPage.facilityValueExportCurrency(), `GBP ${value}`);
    cy.assertText(facilityPage.facilityValueGbp(), `GBP ${value}`);
    facilityPage.facilityMaximumUkefExposure().contains(`GBP ${exposure}`);
    cy.assertText(caseSummary.totalExposure(), `GBP ${exposure}`);
  });

  it('should display the correct amendment version number for the third amendment', () => {
    facilityPage.facilityTabAmendments().click();
    cy.completeValueTFMAmendment({ value: amendment3Value, existingValue: getFormattedMonetaryValue(amendment2Value) });

    amendmentsPage.amendmentDetails.row(1).heading().contains(`Amendment ${ukefFacilityId}-003`);
  });

  it('should show the correct details for amendment 3 on facility amendments page', () => {
    const value = getFormattedMonetaryValue(amendment3Value);
    const exposure = getFormattedMonetaryValue(Number(amendment3Value) * 0.2);

    cy.assertText(facilityPage.facilityValueExportCurrency(), `GBP ${value}`);
    cy.assertText(facilityPage.facilityValueGbp(), `GBP ${value}`);
    facilityPage.facilityMaximumUkefExposure().contains(`GBP ${exposure}`);
    cy.assertText(caseSummary.totalExposure(), `GBP ${exposure}`);
  });
});
