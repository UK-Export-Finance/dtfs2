import { add } from 'date-fns';
import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import caseDealPage from '../../../pages/caseDealPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import {
  fourDaysAgo,
  fourDaysAgoDay,
  fourDaysAgoFull,
  oneMonthFormattedFull,
  oneMonthFormattedTable,
  todayDay,
  twoMonths,
  twoMonthsFormatted,
  twoMonthsFormattedFull,
  twoMonthsFormattedTable,
  yearWithZeroLetter,
} from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN, CURRENCY } from '../../../../../../e2e-fixtures';

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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonthFormattedTable);
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

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date', year: '22' });

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date', year: yearWithZeroLetter });

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date', year: '20 22' });

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date', year: '2 22' });

      cy.clickContinueButton();

      errorSummary().contains('The year for the amendment request date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the amendment request date must include 4 numbers');

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

      cy.clickContinueButton();

      cy.url().should('contain', 'request-approval');
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', year: '22' });

      cy.clickContinueButton();

      errorSummary().contains('The year for the effective date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

      cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', year: yearWithZeroLetter });

      cy.clickContinueButton();

      errorSummary().contains('The year for the effective date must include 4 numbers');
      amendmentsPage.errorMessage().contains('The year for the effective date must include 4 numbers');

      cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', date: fourDaysAgo });

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

      cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', date: twoMonths });

      cy.clickContinueButton();
      cy.url().should('contain', 'facility-value');
      amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
      cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

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
      cy.url().should('contain', 'facility-value');
      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerEffectiveDate().should('contain', fourDaysAgoDay);
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', twoMonthsFormatted);
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
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', fourDaysAgoFull);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonthFormattedFull);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', twoMonthsFormattedFull);
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(twoMonthsFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 24.60`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60`);

      facilityPage.facilityCoverEndDate().contains(twoMonthsFormattedTable);
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonthFormattedTable);
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

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

      cy.clickContinueButton();

      cy.url().should('contain', 'request-approval');
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', date: fourDaysAgo });

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

      cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', date: twoMonths });

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
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'No');
      amendmentsPage.amendmentAnswerEffectiveDate().should('contain', fourDaysAgoDay);
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', twoMonthsFormatted);

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
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', fourDaysAgoFull);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonthFormattedFull);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', twoMonthsFormattedFull);
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(twoMonthsFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(twoMonthsFormattedTable);
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonthFormattedTable);
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

      cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

      cy.clickContinueButton();

      cy.url().should('contain', 'request-approval');
      // automatic approval
      amendmentsPage.amendmentRequestApprovalNo().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-effective-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--effective-date', date: fourDaysAgo });

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
      cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

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

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', todayDay);
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
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', fourDaysAgoFull);
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonthFormattedTable);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 123.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 24.60`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 123.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 24.60 as at ${fourDaysAgoFull}`);

      facilityPage.facilityCoverEndDate().contains(oneMonthFormattedTable);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });
});
