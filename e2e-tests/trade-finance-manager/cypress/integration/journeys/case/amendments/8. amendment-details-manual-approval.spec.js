import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_DECISIONS } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Amendments - Manual approval journey', () => {
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
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerEffectiveDate().should('not.exist');
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.tomorrowDay);
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      amendmentsPage.continueAmendment().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });

    it('should display the `Not added` decision for Cover end date AND Facility value', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', '-');
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2020');
      amendmentsPage.amendmentDetails.row(1).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);
    });
  });

  describe('Amendment details - Change the Cover end date', () => {
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
      // manual approval
      amendmentsPage.amendmentRequestApprovalYes().click();
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

      // update both the cover end date and the facility value
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');

      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);

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
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerEffectiveDate().should('not.exist');
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.tomorrowDay);
      amendmentsPage.amendmentAnswerFacilityValue().should('not.exist');

      amendmentsPage.continueAmendment().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });

    it('should display the `Not added` decision for Cover end date', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', '-');
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', '20 October 2020');
      amendmentsPage.amendmentDetails.row(1).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', dateConstants.tomorrowDay);
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('not.exist');
    });
  });

  describe('Amendment details - Change the Facility value', () => {
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
      // manual approval
      amendmentsPage.amendmentRequestApprovalYes().click();
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
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
      amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'facility-value');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerEffectiveDate().should('not.exist');
      amendmentsPage.amendmentAnswerCoverEndDate().should('not.exist');
      amendmentsPage.amendmentAnswerFacilityValue().should('contain', 'GBP 123.00');

      amendmentsPage.continueAmendment().click();
      amendmentsPage.addAmendmentButton().should('not.exist');
    });

    it('should display the `Not added` decision for Facility value', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.amendmentDetails.row(1).bankDecision().should('contain', UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION);
      amendmentsPage.amendmentDetails.row(1).heading().should('contain', 'Amendment 1');
      amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', '-');
      amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('not.exist');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('not.exist');

      amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
      amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
      amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED);
    });
  });
});
