import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import caseDealPage from '../../../pages/caseDealPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_DECISIONS } from '../../../../../../e2e-fixtures';
import { CURRENCY } from '../../../../../../e2e-fixtures/constants.fixture';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Amendments - automatic approval journey', () => {
  describe('Amendment details - Change the Cover end date AND Facility value', () => {
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

    it('should display facility details and values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains('25 months');
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
      facilityPage.facilityTenor().contains('25 months');
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

      amendmentsPage.continueAmendment().click();

      amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type('2O22');

      amendmentsPage.continueAmendment().click();

      amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type('20 22');

      amendmentsPage.continueAmendment().click();

      amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type('2 22');

      amendmentsPage.continueAmendment().click();

      amendmentsPage.errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'request-approval');
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-effective-date');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type('22');

      amendmentsPage.continueAmendment().click();

      amendmentsPage.errorSummary().contains('The year for the effective date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type('2O22');

      amendmentsPage.continueAmendment().click();

      amendmentsPage.errorSummary().contains('The year for the effective date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.fourDaysAgoMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.fourDaysAgoYear);
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

      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.twoMonthsDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.twoMonthsMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.twoMonthsYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'facility-value');
      amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
      amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');
    });

    it('should validate the content on `Check your answers` page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.continueAmendmentButton().click();
      cy.url().should('contain', 'request-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'request-approval');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-effective-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'facility-value');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerEffectiveDate().should('contain', dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.twoMonthsFormatted);
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      amendmentsPage.continueAmendment().click();
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().should('not.contain', '25 months');
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
      facilityPage.facilityTenor().should('not.contain', '25 months');
    });
  });

  describe('Amendment details - Change the Cover End Date', () => {
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

    it('should display facility details and values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains('25 months');
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
      facilityPage.facilityTenor().contains('25 months');
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
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'request-approval');
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-effective-date');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.fourDaysAgoMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.fourDaysAgoYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update the cover end date only
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');

      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.twoMonthsDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.twoMonthsMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.twoMonthsYear);

      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');
    });

    it('should validate the content on `Check your answers` page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.continueAmendmentButton().click();
      cy.url().should('contain', 'request-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'request-approval');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-effective-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerEffectiveDate().should('contain', dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.twoMonthsFormatted);

      amendmentsPage.continueAmendment().click();
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().should('not.contain', '25 months');
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.twoMonthsFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.twoMonthsFormattedTable);
      facilityPage.facilityTenor().should('not.contain', '25 months');
    });
  });

  describe('Amendment details - Change the Facility Value', () => {
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

    it('should display facility details and values on deal and facility page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains('25 months');
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
      facilityPage.facilityTenor().contains('25 months');
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
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'request-approval');
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-effective-date');

      amendmentsPage.amendmentEffectiveDayInput().clear().focused().type(dateConstants.fourDaysAgoDay);
      amendmentsPage.amendmentEffectiveMonthInput().clear().focused().type(dateConstants.fourDaysAgoMonth);
      amendmentsPage.amendmentEffectiveYearInput().clear().focused().type(dateConstants.fourDaysAgoYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update the facility value
      amendmentsPage.amendmentFacilityValueCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'facility-value');
      amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
      amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');
    });

    it('should validate the content on `Check your answers` page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.continueAmendmentButton().click();
      cy.url().should('contain', 'request-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'request-approval');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-effective-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'facility-value');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      amendmentsPage.continueAmendment().click();
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains('25 months');
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityEndDate().contains(dateConstants.oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60 as at ${dateConstants.fourDaysAgoFull}`);

      facilityPage.facilityCoverEndDate().contains(dateConstants.oneMonthFormattedTable);
      facilityPage.facilityTenor().contains('25 months');
    });
  });
});
