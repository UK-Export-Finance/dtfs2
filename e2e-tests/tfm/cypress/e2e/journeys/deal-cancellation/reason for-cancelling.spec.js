import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import reasonForCancellingPage from '../../pages/deal-cancellation/reason-for-cancelling';
import { backLink, cancelLink, continueButton, errorSummary } from '../../partials';

context('Amendments underwriting - add banks decision - proceed', () => {
  let dealId;
  let dealFacilities;

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

  beforeAll(() => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));

    caseDealPage.cancelButton().click();
  });

  it('should render page correctly', () => {
    errorSummary();
    cancelLink();
    continueButton();
    backLink();
    reasonForCancellingPage.reasonForCancellingTextBox();
  });
});
