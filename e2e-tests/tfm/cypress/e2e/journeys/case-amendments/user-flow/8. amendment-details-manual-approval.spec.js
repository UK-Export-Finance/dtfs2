import { add } from 'date-fns';
import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { oneMonth, today, tomorrow } from '../../../../../../e2e-fixtures/dateConstants';
import { NOT_ADDED } from '../../../../fixtures/constants';
import { PIM_USER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN, CURRENCY } from '../../../../../../e2e-fixtures';
import caseDealPage from '../../../pages/caseDealPage';

context('Amendments - Manual approval journey', () => {
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
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

      cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: tomorrow.dayLong });

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
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'facility-value');
      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', today.dayLong);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerEffectiveDate().should('not.exist');
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', tomorrow.dayLong);
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      cy.clickContinueButton();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });

    it('should display the `Not added` decision for Cover end date AND Facility value', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', NOT_ADDED.DASH);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.dMMMMyyyy);
      amendmentsPage.amendmentDetails.row(1).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);
    });

    it('should display facility details and values on deal and facility page as amendment not completed', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });

  describe('Amendment details - Change the Cover end date', () => {
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
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
      // manual approval
      amendmentsPage.amendmentRequestApprovalYes().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update both the cover end date and the facility value
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      cy.clickContinueButton();

      cy.url().should('contain', 'cover-end-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: tomorrow.dayLong });

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
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', today.dayLong);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerEffectiveDate().should('not.exist');
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', tomorrow.dayLong);
      amendmentsPage.amendmentAnswerFacilityValue().should('not.exist');

      cy.clickContinueButton();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });

    it('should display the `Not added` decision for Cover end date', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', NOT_ADDED.DASH);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.ddMMMMyyyy);
      amendmentsPage.amendmentDetails.row(1).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('not.exist');
    });

    it('should display facility details and values on deal and facility page as amendment not completed', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });

  describe('Amendment details - Change the Facility value', () => {
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
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
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
      // manual approval
      amendmentsPage.amendmentRequestApprovalYes().click();
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
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      cy.clickContinueButton();
      cy.url().should('contain', 'facility-value');
      cy.clickContinueButton();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', today.dayLong);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerEffectiveDate().should('not.exist');
      amendmentsPage.amendmentAnswerCoverEndDate().should('not.exist');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('not.exist');
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      cy.clickContinueButton();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });

    it('should display the `Not added` decision for Facility value', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', NOT_ADDED.DASH);
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('not.exist');

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);
    });

    it('should display facility details and values on deal and facility page as amendment not completed', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.dMMMMyyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });
});
