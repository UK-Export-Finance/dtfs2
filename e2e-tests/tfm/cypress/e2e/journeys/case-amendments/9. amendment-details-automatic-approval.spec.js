import { add } from 'date-fns';
import relative from '../../relativeURL';
import { errorSummary } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import caseDealPage from '../../pages/caseDealPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN, CURRENCY } from '../../../../../e2e-fixtures';

const tfmFacilityEndDateEnabled = Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true';

context('Amendments - automatic approval journey', () => {
  // If the expiry & commencement date are the same day of the month then we add one to the month
  // difference for BS (but not for EWCS)
  // BUT... If the commencement date is end of month and the expiry date isn't then we don't add one
  //
  // In these tests, the mock start date is two years ago today & the mock end date is a month today.
  // Therefore if today is EOM and a month from now is not EOM we need to NOT add one to the tenor
  const todayIsEndOfMonth = add(new Date(), { days: 1 }).getDate() === 1;
  const aMonthFromNowIsEndOfMonth = add(new Date(), { months: 1, days: 1 }).getDate() === 1;
  const facilityTenor = todayIsEndOfMonth && !aMonthFromNowIsEndOfMonth ? '25 months' : '26 months';

  describe('Amendment details - Change the Cover end date AND Facility value', () => {
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

    it('should display facility details and values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
      facilityPage.facilityTenor().contains(facilityTenor);
    });

    it('should take you to `Check your answers page` page', () => {
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
      amendmentsPage.amendmentRequestYearInput().clear().focused().type('22');

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type('2O22');

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type('20 22');

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type('2 22');

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'request-approval');
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type('22');

      cy.clickContinueButton();

      errorSummary().contains('The year for the effective date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type('2O22');

      cy.clickContinueButton();

      errorSummary().contains('The year for the effective date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.fourDaysAgoMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.fourDaysAgoYear);
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
      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.twoMonthsDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.twoMonthsMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.twoMonthsYear);
      cy.clickContinueButton();

      if (tfmFacilityEndDateEnabled) {
        amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
      }

      cy.url().should('contain', 'facility-value');
      amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
      amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');
    });

    it('should validate the content on `Check your answers` page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'request-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'request-approval');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      cy.clickContinueButton();
      if (tfmFacilityEndDateEnabled) {
        amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
      }
      cy.url().should('contain', 'facility-value');
      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerEffectiveDate().should('contain', dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.twoMonthsFormatted);
      if (tfmFacilityEndDateEnabled) {
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('contain', 'Yes');
      }
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      cy.clickContinueButton();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    });

    it('should display the Automatic approval for Cover end date AND Facility value', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', dateConstants.fourDaysAgoFull);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.twoMonthsFormattedFull);
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
    });

    it('should display amendment changed dates and values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().should('not.contain', facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.twoMonthsFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 24.60`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.twoMonthsFormattedTable);
      facilityPage.facilityTenor().should('not.contain', facilityTenor);
    });
  });

  describe('Amendment details - Change the Cover End Date', () => {
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

    it('should display facility details and values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
      facilityPage.facilityTenor().contains(facilityTenor);
    });

    it('should take you to `Check your answers` page', () => {
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
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.fourDaysAgoMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.fourDaysAgoYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update the cover end date only
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      cy.clickContinueButton();

      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.twoMonthsDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.twoMonthsMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.twoMonthsYear);
      cy.clickContinueButton();

      if (tfmFacilityEndDateEnabled) {
        amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
      }

      cy.url().should('contain', 'check-answers');
    });

    it('should validate the content on `Check your answers` page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'request-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'request-approval');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      cy.clickContinueButton();
      if (tfmFacilityEndDateEnabled) {
        amendmentsPage.navigateThroughFacilityEndDateAmendmentPages();
      }
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerEffectiveDate().should('contain', dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.twoMonthsFormatted);

      cy.clickContinueButton();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    });

    it('should display the Automatic approval for Cover end date', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', dateConstants.fourDaysAgoFull);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.twoMonthsFormattedFull);
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('not.exist');
    });

    it('should display amendment changed dates on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().should('not.contain', facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.twoMonthsFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.twoMonthsFormattedTable);
      facilityPage.facilityTenor().should('not.contain', facilityTenor);
    });
  });

  describe('Amendment details - Change the Facility Value', () => {
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

    it('should display facility details and values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
      facilityPage.facilityTenor().contains(facilityTenor);
    });

    it('should take you to `Check your answers page` page', () => {
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
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.fourDaysAgoMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.fourDaysAgoYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update the facility value
      amendmentsPage.amendmentFacilityValueCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-value');
      amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
      amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');
    });

    it('should validate the content on `Check your answers` page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'request-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'request-approval');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'facility-value');
      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      cy.clickContinueButton();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    });

    it('should display the Automatic approval for Facility value', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', dateConstants.fourDaysAgoFull);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('not.exist');

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
    });

    it('should display amendment changed values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60 as at ${dateConstants.fourDaysAgoFull}`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });
});
