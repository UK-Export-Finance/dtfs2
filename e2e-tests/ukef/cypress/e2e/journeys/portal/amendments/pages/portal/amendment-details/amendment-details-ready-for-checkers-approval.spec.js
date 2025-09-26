import { CURRENCY, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { today } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';
import { printButton, submitButton } from '../../../../../../partials';

import amendmentPage from '../../../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';
import amendmentSummaryList from '../../../../../../../../../gef/cypress/e2e/pages/amendments/amendment-summary-list';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '10000';

context('Amendments - Ready for checkers approval - Amendment details page', () => {
  let dealId;
  let facilityId;
  let dealUrl;
  const users = [BANK1_MAKER1, BANK1_CHECKER1];

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      dealUrl = relative(`/gef/application-details/${dealId}`);
      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(dealUrl);

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.makerSubmitPortalAmendmentForReview({ changedFacilityValue: CHANGED_FACILITY_VALUE, facilityValueExists: true });
      });
    });
  });

  users.forEach((user) => {
    const userName = user.roles;
    describe(`Amendment details page - Ready for checkers approval - Login as a ${userName}`, () => {
      after(() => {
        cy.clearCookies();
        cy.clearSessionCookies();
      });

      beforeEach(() => {
        cy.clearSessionCookies();
        cy.login(user);
        cy.visit(dealUrl);
        applicationPreview.amendmentDetailsReadyForCheckerLink(1).click();
      });

      it('should render the correct heading and back link', () => {
        amendmentPage.pageHeading().contains('Amendment details');
        amendmentPage
          .backLink()
          .invoke('attr', 'href')
          .then((href) => {
            expect(href).to.equal(`/gef/application-details/${dealId}`);
          });
      });

      it('should redirect to the dashboard when clicking the back link', () => {
        amendmentPage.backLink().click();
        cy.url().should('eq', dealUrl);
      });

      it('should render a print button', () => {
        printButton().should('exist');
        cy.assertText(printButton(), 'Print page');
      });

      it('should render the print dialogue when clicking the print button', () => {
        cy.assertPrintDialogue(printButton);
      });

      it('should display a summary list with the correct changes and new facility value', () => {
        amendmentSummaryList.amendmentSummaryListTable().amendmentOptionsKey().contains('Changes');
        amendmentSummaryList.amendmentSummaryListTable().amendmentOptionsValue().contains('Facility value');
        amendmentSummaryList.amendmentSummaryListTable().amendmentOptionsChangeLink().should('not.exist');

        cy.assertText(amendmentSummaryList.amendmentSummaryListTable().facilityValueKey(), 'New facility value');
        cy.assertText(
          amendmentSummaryList.amendmentSummaryListTable().facilityValueValue(),
          `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE)}`,
        );
        amendmentSummaryList.amendmentSummaryListTable().facilityValueChangeLink().should('not.exist');
      });

      it('should NOT render facility end date row or bank review date rows', () => {
        amendmentSummaryList.amendmentSummaryListTable().facilityEndDateKey().should('not.exist');
        amendmentSummaryList.amendmentSummaryListTable().facilityEndDateValue().should('not.exist');
        amendmentSummaryList.amendmentSummaryListTable().facilityEndDateChangeLink().should('not.exist');

        amendmentSummaryList.amendmentSummaryListTable().bankReviewDateKey().should('not.exist');
        amendmentSummaryList.amendmentSummaryListTable().bankReviewDateValue().should('not.exist');
        amendmentSummaryList.amendmentSummaryListTable().bankReviewDateChangeLink().should('not.exist');
      });

      it('should display a summary list with the eligibility questions and answers', () => {
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionKey(1), '1. The Facility is not an Affected Facility');
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionValue(1), 'True');
        amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(1).should('not.exist');

        cy.assertText(
          amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionKey(2),
          '2. Neither the Exporter, nor its UK Parent Obligor is an Affected Person',
        );
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionValue(2), 'True');
        amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(2).should('not.exist');

        cy.assertText(
          amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionKey(3),
          '3. The Cover Period of the Facility is within the Facility Maximum Cover Period',
        );
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionValue(3), 'True');
        amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(3).should('not.exist');

        cy.assertText(
          amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionKey(4),
          '4. The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency) of the Facility is not more than the lesser of (i) the Available Master Guarantee Limit; and the Available Obligor(s) Limit',
        );
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionValue(4), 'True');
        amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(4).should('not.exist');

        cy.assertText(
          amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionKey(5),
          '5. The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate any issue raised during its Bank Due Diligence internally to any Relevant Person for approval as part of its usual Bank Due Diligence',
        );
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionValue(5), 'True');
        amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(5).should('not.exist');

        cy.assertText(
          amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionKey(6),
          '6. The Bank is the sole and legal beneficial owner of, and has good title to, the Facility and any Utilisation thereunder',
        );
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionValue(6), 'True');
        amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(6).should('not.exist');

        cy.assertText(
          amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionKey(7),
          `7. The Bank's right, title and interest in and to the Facility and any Utilisation thereunder (including any indebtedness, obligation of liability of each Obligor) is free and clear of any Security or Quasi-Security (other than Permitted Security)`,
        );
        cy.assertText(amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionValue(7), 'True');
        amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(7).should('not.exist');
      });

      it('should display a summary list the correct effective date', () => {
        cy.assertText(amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateKey(), 'Date');
        cy.assertText(amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateValue(), today.d_MMMM_yyyy);
        amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateChangeLink().should('not.exist');
      });

      if (user === BANK1_MAKER1) {
        it('should not display submit the deal action buttons', () => {
          amendmentPage.returnButton().should('not.exist');
          submitButton().should('not.exist');
        });
      }

      if (user === BANK1_CHECKER1) {
        it('should display submit the deal action buttons', () => {
          amendmentPage.returnButton().should('exist');
          submitButton().should('exist');
        });
      }
    });
  });
});
