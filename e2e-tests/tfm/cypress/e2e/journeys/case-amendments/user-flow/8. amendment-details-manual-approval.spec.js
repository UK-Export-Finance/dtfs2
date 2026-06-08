import { MOCK_DEAL_AIN, oneMonth, today, tomorrow } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import { NOT_ADDED } from '../../../../fixtures/constants';
import { PIM_USER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN, CURRENCY } from '../../../../../../e2e-fixtures';
import caseDealPage from '../../../pages/caseDealPage';
import { calculateTestFacilityTenorValue } from '../../../../support/utils/facility-tenor';

context('Amendments - Manual approval journey', () => {
  const facilityTenor = calculateTestFacilityTenorValue();

  describe('Amendment details - Change the Cover end date AND Facility value', () => {
    let dealId;
    let facilityId;
    let ukefFacilityId;
    const dealFacilities = [];

    before(() => {
      return cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal?._id || insertedDeal?.deal?._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        return cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
          facilityId = createdFacilities[0]?._id;
          ukefFacilityId = createdFacilities[0]?.ukefFacilityId;

          return cy.submitDeal(dealId, dealType, PIM_USER_1);
        });
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

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });

    it('should take you to `Check your answers page` page', () => {
      cy.login(PIM_USER_1);
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
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
      const rowIndex = 1;

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(rowIndex).heading().should('have.attr', 'data-cy', `amendment--heading-${rowIndex}`);
      amendmentsPage.amendmentDetails.row(rowIndex).heading().should('contain', `Amendment ${ukefFacilityId}-001`);
      amendmentsPage.amendmentDetails.row(rowIndex).effectiveDate().should('contain', NOT_ADDED.DASH);
      amendmentsPage.amendmentDetails.row(rowIndex).currentCoverEndDate().should('contain', oneMonth.d_MMMM_yyyy);
      amendmentsPage.amendmentDetails.row(rowIndex).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(rowIndex).newCoverEndDate().should('contain', tomorrow.dayLong);
      amendmentsPage.amendmentDetails.row(rowIndex).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);

      amendmentsPage.amendmentDetails.row(rowIndex).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(rowIndex).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(rowIndex).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);
    });

    it('should display facility details and values on deal and facility page as amendment not completed', () => {
      cy.login(PIM_USER_1);

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalValue().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).totalExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });

  describe('Amendment details - Change the Cover end date', () => {
    let dealId;
    let facilityId;
    let ukefFacilityId;
    const dealFacilities = [];

    before(() => {
      return cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal?._id || insertedDeal?.deal?._id;

        if (!dealId) {
          throw new Error('Expected a created deal id in before hook');
        }

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        return cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
          facilityId = createdFacilities[0]?._id;
          ukefFacilityId = createdFacilities[0]?.ukefFacilityId;
          if (!facilityId) {
            throw new Error('Expected a created facility id in before hook');
          }
          if (!ukefFacilityId) {
            throw new Error('Expected a created UKEF facility id in before hook');
          }

          return cy.submitDeal(dealId, dealType, PIM_USER_1);
        });
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

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });

    it('should take you to `Check your answers page` page', () => {
      cy.login(PIM_USER_1);
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
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
      const rowIndex = 1;

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(rowIndex).heading().should('have.attr', 'data-cy', `amendment--heading-${rowIndex}`);
      amendmentsPage.amendmentDetails.row(rowIndex).heading().should('contain', `Amendment ${ukefFacilityId}-001`);
      amendmentsPage.amendmentDetails.row(rowIndex).effectiveDate().should('contain', NOT_ADDED.DASH);
      amendmentsPage.amendmentDetails.row(rowIndex).currentCoverEndDate().should('contain', oneMonth.dd_MMMM_yyyy);
      amendmentsPage.amendmentDetails.row(rowIndex).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(rowIndex).newCoverEndDate().should('contain', tomorrow.dayLong);
      amendmentsPage.amendmentDetails.row(rowIndex).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);

      amendmentsPage.amendmentDetails.row(rowIndex).currentFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(rowIndex).newFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(rowIndex).ukefDecisionFacilityValue().should('not.exist');
    });

    it('should display facility details and values on deal and facility page as amendment not completed', () => {
      cy.login(PIM_USER_1);

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });

  describe('Amendment details - Change the Facility value', () => {
    let dealId;
    let facilityId;
    let ukefFacilityId;
    const dealFacilities = [];

    before(() => {
      return cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal?._id || insertedDeal?.deal?._id;

        if (!dealId) {
          throw new Error('Expected a created deal id in before hook');
        }

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        return cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
          facilityId = createdFacilities[0]?._id;
          ukefFacilityId = createdFacilities[0]?.ukefFacilityId;
          if (!facilityId) {
            throw new Error('Expected a created facility id in before hook');
          }
          if (!ukefFacilityId) {
            throw new Error('Expected a created UKEF facility id in before hook');
          }

          return cy.submitDeal(dealId, dealType, PIM_USER_1);
        });
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

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });

    it('should take you to `Check your answers page` page', () => {
      cy.login(PIM_USER_1);
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
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
      const rowIndex = 1;

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(rowIndex).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(rowIndex).heading().should('have.attr', 'data-cy', `amendment--heading-${rowIndex}`);
      amendmentsPage.amendmentDetails.row(rowIndex).heading().should('contain', `Amendment ${ukefFacilityId}-001`);
      amendmentsPage.amendmentDetails.row(rowIndex).effectiveDate().should('contain', NOT_ADDED.DASH);
      amendmentsPage.amendmentDetails.row(rowIndex).currentCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(rowIndex).newCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(rowIndex).ukefDecisionCoverEndDate().should('not.exist');

      amendmentsPage.amendmentDetails.row(rowIndex).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(rowIndex).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(rowIndex).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);
    });

    it('should display facility details and values on deal and facility page as amendment not completed', () => {
      cy.login(PIM_USER_1);

      cy.visit(relative(`/case/${dealId}/deal`));
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(facilityTenor);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(`${CURRENCY.GBP} 12,345.00`);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(`${CURRENCY.GBP} 2,469.00`);

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityValueExportCurrency().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityValueGbp().contains(`${CURRENCY.GBP} 12,345.00`);
      facilityPage.facilityMaximumUkefExposure().contains(`${CURRENCY.GBP} 2,469.00`);

      facilityPage.facilityCoverEndDate().contains(oneMonth.d_MMMM_yyyy);
      facilityPage.facilityTenor().contains(facilityTenor);
    });
  });
});
