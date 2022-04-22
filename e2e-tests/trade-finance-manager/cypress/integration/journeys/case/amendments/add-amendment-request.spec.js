import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import amendmentsRequestPage from '../../../pages/amendments/amendmentsRequestPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../fixtures/dateConstants';
import { PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

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

    it('Clicking on add an amendment button takes you to amendment request page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
      amendmentsPage.addAmendmentButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}/amendments/request`));
    });

    it('Amendments request page should contain the correct elements', () => {
      amendmentsRequestPage.amendmentRequestHeading().contains('What date did the bank request the amendment?');
      amendmentsRequestPage.amendmentRequestHint().contains('For example, 31 3 1980');
      amendmentsRequestPage.amendmentRequestDayInput();
      amendmentsRequestPage.amendmentRequestMonthInput();
      amendmentsRequestPage.amendmentRequestYearInput();
      amendmentsRequestPage.continueButton();
      amendmentsRequestPage.cancelLink();
    });

    it('Clicking continue on blank inputs should return errors', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().click();

      amendmentsRequestPage.continueButton().click();

      amendmentsRequestPage.errorSummary().contains('Enter the date the bank requested the amendment');
      amendmentsRequestPage.errorMessage().contains('Enter the date the bank requested the amendment');
    });

    it('Clicking continue on past date should return errors', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().click();

      amendmentsRequestPage.amendmentRequestDayInput().type('01');
      amendmentsRequestPage.amendmentRequestMonthInput().type('01');
      amendmentsRequestPage.amendmentRequestYearInput().type('2020');

      amendmentsRequestPage.continueButton().click();

      amendmentsRequestPage.errorSummary().contains('Amendment request date cannot be before the notice submission date');
      amendmentsRequestPage.errorMessage().contains('Amendment request date cannot be before the notice submission date');
    });

    it('Clicking continue on future date should return errors', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().click();

      amendmentsRequestPage.amendmentRequestDayInput().type(dateConstants.threeMonthsDay);
      amendmentsRequestPage.amendmentRequestMonthInput().type(dateConstants.threeMonthsMonth);
      amendmentsRequestPage.amendmentRequestYearInput().type(dateConstants.threeMonthsYear);

      amendmentsRequestPage.continueButton().click();

      amendmentsRequestPage.errorSummary().contains('Amendment request date cannot be in the future');
      amendmentsRequestPage.errorMessage().contains('Amendment request date cannot be in the future');
    });

    it('Clicking cancel should take you back to amendments page', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().click();

      amendmentsRequestPage.cancelLink().click();
      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}#amendments`));
    });

    it('Adding correct request date should redirect', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().click();

      amendmentsRequestPage.amendmentRequestDayInput().type(dateConstants.todayDay);
      amendmentsRequestPage.amendmentRequestMonthInput().type(dateConstants.todayMonth);
      amendmentsRequestPage.amendmentRequestYearInput().type(dateConstants.todayYear);

      amendmentsRequestPage.continueButton().click();

      cy.url().should('contain', relative(`/case/${dealId}/facility/${facilityId}#amendments`));
    });
  });
});
