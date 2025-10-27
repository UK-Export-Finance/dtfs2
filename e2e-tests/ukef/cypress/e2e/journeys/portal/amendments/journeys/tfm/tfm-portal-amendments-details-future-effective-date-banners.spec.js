import { tomorrow, today } from '@ukef/dtfs2-common/test-helpers';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import amendmentsPage from '../../../../../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const mockFacility2 = {
  ...mockFacility,
  ukefFacilityId: '10000013',
};

const CHANGED_FACILITY_VALUE = '20000';
const CHANGE_FACILITY_VALUE_2 = '30000';

context('Amendments - TFM - TFM should display the banner on amendement details page only for amendment with a future effective date', () => {
  let dealId;
  let facilityId;
  let ukefFacilityId;
  let applicationDetailsUrl;
  let tfmDealPage;
  let tfmFacilityPage;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility2], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        ukefFacilityId = createdFacility.details.ukefFacilityId;

        tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
        tfmFacilityPage = `${TFM_URL}/case/${dealId}/facility/${facilityId}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          applicationDetailsUrl,
          facilityId,
          dealId,
          effectiveDate: today.date,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGE_FACILITY_VALUE_2,
          applicationDetailsUrl,
          facilityId,
          dealId,
          effectiveDate: tomorrow.date,
        });
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);
    cy.visit(tfmDealPage);
  });

  it('should display the future effective date banners once on the deal', () => {
    cy.assertText(
      amendmentsPage.amendmentFutureEffectiveDateDealBar(ukefFacilityId),
      `There is an amendment (${ukefFacilityId}-002) on Facility ID ${ukefFacilityId} effective on ${tomorrow.dd_MMMM_yyyy}. See amendment details`,
    );

    amendmentsPage
      .amendmentFutureEffectiveDateDealLink(ukefFacilityId)
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/case/${dealId}/facility/${facilityId}#amendments`);
      });

    cy.assertText(
      amendmentsPage.amendmentFutureEffectiveDateDealBar(ukefFacilityId),
      `There is an amendment (${ukefFacilityId}-002) on Facility ID ${ukefFacilityId} effective on ${tomorrow.dd_MMMM_yyyy}. See amendment details`,
    );

    amendmentsPage
      .amendmentFutureEffectiveDateDealLink(ukefFacilityId)
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/case/${dealId}/facility/${facilityId}#amendments`);
      });
  });

  it('should display the future effective date banner on the facility', () => {
    cy.visit(tfmFacilityPage);
    cy.assertText(amendmentsPage.amendmentFutureEffectiveDateFacilityBar(), `Amendment ${ukefFacilityId}-002 is effective on ${tomorrow.dd_MMMM_yyyy}.`);
  });

  it('should display the future effective date banner only on the amendment with future effective amendment', () => {
    cy.visit(tfmFacilityPage);

    cy.assertText(amendmentsPage.amendmentFutureEffectiveDateFacilityBar(), `Amendment ${ukefFacilityId}-002 is effective on ${tomorrow.dd_MMMM_yyyy}.`);

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.amendmentDetails.row(1).amendmentFutureEffectiveDateAmendmentBar().should('exist');
    cy.assertText(
      amendmentsPage.amendmentDetails.row(1).amendmentFutureEffectiveDateAmendmentBar(),
      `Amendment ${ukefFacilityId}-002 is effective on ${tomorrow.dd_MMMM_yyyy}.`,
    );
    amendmentsPage.amendmentDetails.row(2).amendmentFutureEffectiveDateAmendmentBar().should('not.exist');
  });
});
