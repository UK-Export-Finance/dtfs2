import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, T1_USER_1, UNDERWRITER_MANAGER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../../fixtures/users-portal';
import pages from '../../../pages';

context('Amendments request page', () => {
  describe('Amendments request', () => {
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

    it('add an amendment request', () => {
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

    // it('check amendment request shows on underwriting page as non-PIM and non-underwriter manager', () => {
    //   cy.login(T1_USER_1);
    //   cy.visit(relative(`/case/${dealId}/underwriting`));

    //   // const { ukefFacilityId } = dealFacilities[0];
    // });
  });
});
