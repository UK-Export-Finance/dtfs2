import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, T1_USER_1, UNDERWRITER_MANAGER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import pages from '../../../pages';

context('Amendments underwriting page', () => {
  describe('Amendments underwriting', () => {
    let dealId;
    const dealFacilities = [];

    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
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

    it('should not show amendments on underwriting page as not yet started', () => {
      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      pages.underwritingPage.amendmentHeading().should('not.exist');
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

    it('should shows amendment on underwriting page as non-PIM and non-underwriter manager with no links to add', () => {
      // should be unassigned as nothing added and t1_user is not underwriter manager
      cy.login(T1_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      const { ukefFacilityId, type } = dealFacilities[0];

      pages.underwritingPage.amendmentHeading().contains(`Amendment for ${type.toLowerCase()} facility ${ukefFacilityId}`);

      pages.underwritingPage.amendmentLeadUnderwriterUnassigned().contains('Unassigned');

      pages.underwritingPage.amendmentUnderwriterManagerDecisionNotAdded().contains('Not added yet');

      // dependent on managers decision being added
      pages.underwritingPage.bankDecisionDependent().contains('Dependent on the Underwriter manager\'s decision');
    });

    it('should show amendment on underwriting page with correct assign links as underwriter manager', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      const { ukefFacilityId, type } = dealFacilities[0];

      pages.underwritingPage.amendmentHeading().contains(`Amendment for ${type.toLowerCase()} facility ${ukefFacilityId}`);

      pages.underwritingPage.assignAmendmentLeadUnderwriterButton().contains('Add underwriter');

      pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');

      // dependent on managers decision being added so no link should show
      pages.underwritingPage.bankDecisionDependent().contains('Dependent on the Underwriter manager\'s decision');
    });

    it('should show amendment on underwriting page as PIM with no links to add', () => {
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      const { ukefFacilityId, type } = dealFacilities[0];

      pages.underwritingPage.amendmentHeading().contains(`Amendment for ${type.toLowerCase()} facility ${ukefFacilityId}`);

      pages.underwritingPage.amendmentLeadUnderwriterUnassigned().contains('Unassigned');

      pages.underwritingPage.amendmentUnderwriterManagerDecisionNotAdded().contains('Not added yet');

      pages.underwritingPage.bankDecisionDependent().contains('Dependent on the Underwriter manager\'s decision');
    });
  });
});
