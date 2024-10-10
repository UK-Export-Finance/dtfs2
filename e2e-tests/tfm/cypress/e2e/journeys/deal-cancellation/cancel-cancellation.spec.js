import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import reasonForCancellingPage from '../../pages/deal-cancellation/reason-for-cancelling';
import { backLink } from '../../partials';
import cancelCancellationPage from '../../pages/deal-cancellation/cancel-cancellation';
import bankRequestDatePage from '../../pages/deal-cancellation/bank-request-date';
import effectiveFromDatePage from '../../pages/deal-cancellation/effective-from-date';
import checkDetailsPage from '../../pages/deal-cancellation/check-details';

context('Deal cancellation - cancel cancellation', () => {
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

  describe('when logged in as a PIM user', () => {
    beforeEach(() => {
      cy.login(PIM_USER_1);
    });

    describe('when a cancellation is not in draft', () => {
      beforeEach(() => {
        cy.visit(relative(`/case/${dealId}/deal`));

        caseDealPage.cancelDealButton().click();

        cy.clickCancelLink();
      });

      it('should redirect to deal summary page', () => {
        cy.url().should('eq', relative(`/case/${dealId}/deal`));
      });
    });

    describe('when a cancellation is in draft', () => {
      beforeEach(() => {
        cy.visit(relative(`/case/${dealId}/deal`));

        caseDealPage.cancelDealButton().click();

        cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), 'xxx');
        cy.clickContinueButton();
      });

      describe('when all the values are provided', () => {
        beforeEach(() => {
          cy.completeDateFormFields({ idPrefix: 'bank-request-date' });
          cy.clickContinueButton();

          cy.completeDateFormFields({ idPrefix: 'effective-from-date' });
          cy.clickContinueButton();

          checkDetailsPage.returnLink().click();
        });

        it('"yes, cancel" button navigates to deal summary page', () => {
          cancelCancellationPage.yesCancelButton().click();

          cy.url().should('eq', relative(`/case/${dealId}/deal`));
        });

        it('"yes, cancel" button wipes the cancellation data', () => {
          cancelCancellationPage.yesCancelButton().click();

          caseDealPage.cancelDealButton().click();
          reasonForCancellingPage.reasonForCancellingTextBox().should('have.value', '');
          cy.clickContinueButton();

          bankRequestDatePage.bankRequestDateDay().should('have.value', '');
          bankRequestDatePage.bankRequestDateMonth().should('have.value', '');
          bankRequestDatePage.bankRequestDateYear().should('have.value', '');
          cy.completeDateFormFields({ idPrefix: 'bank-request-date' });
          cy.clickContinueButton();

          effectiveFromDatePage.effectiveFromDateDay().should('have.value', '');
          effectiveFromDatePage.effectiveFromDateMonth().should('have.value', '');
          effectiveFromDatePage.effectiveFromDateYear().should('have.value', '');
        });
      });

      describe('when visiting page by URL navigation', () => {
        beforeEach(() => {
          cy.visit(relative(`/case/${dealId}/cancellation/cancel`));
        });

        it('should render page correctly', () => {
          cy.url().should('eq', relative(`/case/${dealId}/cancellation/cancel`));

          backLink();
          cancelCancellationPage.noGoBackButton();
          cancelCancellationPage.yesCancelButton();
        });

        it(`back link navigates to reason page`, () => {
          cy.clickBackLink();

          cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
        });

        it(`"no, go back" button navigates to reason page`, () => {
          cancelCancellationPage.noGoBackButton().click();

          cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
        });
      });

      describe(`when visiting from check-details page`, () => {
        beforeEach(() => {
          cy.visit(relative(`/case/${dealId}/cancellation/check-details`));
          checkDetailsPage.returnLink().click();
        });

        it(`back link navigates to check-details page`, () => {
          cy.clickBackLink();

          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });

        it(`"no, go back" button navigates to check-details page`, () => {
          cancelCancellationPage.noGoBackButton().click();

          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });
      });

      ['reason', 'bank-request-date', 'effective-from-date'].forEach((page) => {
        describe(`when visiting from ${page} page`, () => {
          beforeEach(() => {
            cy.visit(relative(`/case/${dealId}/cancellation/${page}`));
            cy.clickCancelLink();
          });

          it(`back link navigates to ${page} page`, () => {
            cy.clickBackLink();

            cy.url().should('eq', relative(`/case/${dealId}/cancellation/${page}`));
          });

          it(`"no, go back" button navigates to ${page} page`, () => {
            cancelCancellationPage.noGoBackButton().click();

            cy.url().should('eq', relative(`/case/${dealId}/cancellation/${page}`));
          });
        });
      });
    });
  });

  describe('when logged in as a non-PIM user', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);

      cy.visit(relative(`/case/${dealId}/cancellation/cancel`));
    });

    it('should redirect when visiting reason for cancelling page ', () => {
      cy.url().should('eq', relative('/deals/0'));
    });
  });
});
