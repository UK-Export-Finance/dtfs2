import { CURRENCY, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { today } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview, applicationAmendments } from '../../../../../../../../../gef/cypress/e2e/pages';
import { printButton, submitButton } from '../../../../../../partials';

import amendmentPage from '../../../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';
import amendmentSummaryList from '../../../../../../../../../gef/cypress/e2e/pages/amendments/amendment-summary-list';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '10000';

context('Amendments - Approved amendments - Amendment details page', () => {
  let dealId;
  let facilityId;
  let dealUrl;
  let submittedUrl;
  let amendmentDetailsUrl;

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

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/approved-by-ukef`;
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

          const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

          cy.makerAndCheckerSubmitPortalAmendmentRequest({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
            amendmentDetailsUrl,
            submittedUrl,
            confirmSubmissionToUkefUrl,
          });
        });
      });
    });
  });

  describe(`Amendment details page - Approved Amendments - Login as a maker`, () => {
    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      cy.visit(dealUrl);
      applicationAmendments.subNavigationBarAmendments().click();
    });

    it(`should render the correct approved amendment and the 'See further details' link`, () => {
      applicationAmendments.tabHeading().should('exist');
      applicationAmendments.tabHeading().should('have.text', 'Amendments');
      applicationAmendments
        .amendmentDetailsLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(amendmentDetailsUrl);
        });
    });

    it(`should redirect to the amendment details page when clicking the 'See further details' link`, () => {
      applicationAmendments.amendmentDetailsLink().click();
      cy.url().should('eq', relative(amendmentDetailsUrl));
    });

    it('should render a print button', () => {
      applicationAmendments.amendmentDetailsLink().click();
      printButton().should('exist');
    });

    it('should render the print dialogue when clicking the print button', () => {
      applicationAmendments.amendmentDetailsLink().click();
      cy.assertPrintDialogue(printButton);
    });

    it('should display a summary list with the correct changes and new facility value', () => {
      applicationAmendments.amendmentDetailsLink().click();
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

    it('should not render facility end date row or bank review date rows', () => {
      applicationAmendments.amendmentDetailsLink().click();
      amendmentSummaryList.amendmentSummaryListTable().facilityEndDateKey().should('not.exist');
      amendmentSummaryList.amendmentSummaryListTable().facilityEndDateValue().should('not.exist');
      amendmentSummaryList.amendmentSummaryListTable().facilityEndDateChangeLink().should('not.exist');

      amendmentSummaryList.amendmentSummaryListTable().bankReviewDateKey().should('not.exist');
      amendmentSummaryList.amendmentSummaryListTable().bankReviewDateValue().should('not.exist');
      amendmentSummaryList.amendmentSummaryListTable().bankReviewDateChangeLink().should('not.exist');
    });

    it('should display a summary list with the eligibility questions and answers', () => {
      applicationAmendments.amendmentDetailsLink().click();
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
      applicationAmendments.amendmentDetailsLink().click();
      cy.assertText(amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateKey(), 'Date');
      cy.assertText(amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateValue(), today.d_MMMM_yyyy);
      amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateChangeLink().should('not.exist');
    });

    it('should not display return button', () => {
      applicationAmendments.amendmentDetailsLink().click();
      amendmentPage.returnButton().should('not.exist');
    });

    it('should not display submit the deal action buttons', () => {
      applicationAmendments.amendmentDetailsLink().click();
      amendmentPage.abandon().should('not.exist');
      submitButton().should('not.exist');
    });
  });
});
