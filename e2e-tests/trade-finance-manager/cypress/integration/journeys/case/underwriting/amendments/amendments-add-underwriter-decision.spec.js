import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, UNDERWRITER_MANAGER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../../fixtures/users-portal';
import pages from '../../../../pages';

context('Amendments underwriting - add underwriter decision', () => {
  describe('Amendments add underwriter decision', () => {
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

    it('it should add an amendment request', () => {
      // adds the amendment
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
      amendmentsPage.addAmendmentButton().click();
      cy.url().should('contain', 'request-date');
      amendmentsPage.amendmentRequestHeading().contains('What date did the bank request the amendment?');
      amendmentsPage.amendmentRequestHint().contains('For example, 31 3 1980');
      amendmentsPage.amendmentRequestDayInput();
      amendmentsPage.amendmentRequestMonthInput();
      amendmentsPage.amendmentRequestYearInput();
      amendmentsPage.continueAmendment();

      amendmentsPage.amendmentRequestDayInput().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().type(dateConstants.todayYear);

      amendmentsPage.continueAmendment().click();
    });

    it('it should take you to add underwriter decision page as underwriter manager when adding an underwriter decision', () => {
      cy.login(UNDERWRITER_MANAGER_1);
      cy.visit(relative(`/case/${dealId}/underwriting`));

      const { _id } = dealFacilities[0];

      pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');

      pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });

      cy.url().should('contain', `case/${dealId}/facility/${_id}/amendment`);
      cy.url().should('contain', '/managers-decision');

      pages.amendmentUnderwriterDecisionPage.heading().contains('What\'s your decision?');

      pages.amendmentUnderwriterDecisionPage.decisionRadioInputApproveWithoutConditions();
      pages.amendmentUnderwriterDecisionPage.decisionApproveWithoutConditionsHint().contains('You’ll be able to add comments that only UKEF can see later.');
      pages.amendmentUnderwriterDecisionPage.decisionRadioInputApproveWithConditions();
      pages.amendmentUnderwriterDecisionPage.decisionApproveWithConditionsHint().contains('You’ll be able to add conditions to the approval later.');
      pages.amendmentUnderwriterDecisionPage.decisionRadioInputDecline();
      pages.amendmentUnderwriterDecisionPage.decisionDeclineHint().contains('You’ll be able to add the reasons why you are declining the change later.');
    });
  });
});
