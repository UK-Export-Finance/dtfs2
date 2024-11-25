import gefPages from '../../../../../../../gef/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT, MOCK_APPLICATION_MIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility, anUnissuedCashFacility, multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { yesterday, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Deal cancellation', () => {
  const dealIdsWithEffectiveDate = [];
  const dealFacilities = [];
  const allDealFacilities = [];
  const ainDeals = Array(4).fill(MOCK_APPLICATION_AIN_DRAFT);
  const minDeals = Array(4).fill(MOCK_APPLICATION_MIN_DRAFT);
  const gefDeals = [...ainDeals, ...minDeals];

  const facilities = [
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    anUnissuedCashFacility({ facilityEndDateEnabled: true }),
    multipleMockGefFacilities({ facilityEndDateEnabled: true }).unissuedContingentFacility,
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    anIssuedCashFacility({ facilityEndDateEnabled: true }),
    multipleMockGefFacilities({ facilityEndDateEnabled: true }).unissuedContingentFacility,
    anUnissuedCashFacility({ facilityEndDateEnabled: true }),
  ];

  before(() => {
    cy.insertManyGefDeals(gefDeals, BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((deal, index) => {
        dealIdsWithEffectiveDate.push({ id: deal._id, effectiveDate: index % 2 === 0 ? tomorrow.date : yesterday.date });
        // updates a gef deal so has relevant fields
        cy.updateGefDeal(deal._id, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

        cy.createGefFacilities(deal._id, [facilities[index]], BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.push(createdFacilities.details);
        });
        allDealFacilities.push(dealFacilities);
      });
    });
  });

  beforeEach(() => {
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  describe('Deal cancellations on tfm with effective dates in the past and in the future', () => {
    before(() => {
      dealIdsWithEffectiveDate.forEach((dealIdWithEffectiveDate) => {
        cy.gefDealCancellationFlow(dealIdWithEffectiveDate.id, dealIdWithEffectiveDate.effectiveDate);
      });
      cy.clearCookie('dtfs-session');
      cy.clearCookie('_csrf');
      cy.getCookies().should('be.empty');
      cy.login(BANK1_MAKER1);
    });

    it('Gef AIN deal with issued facilities is submitted to UKEF, user cancel deal in the future in TFM. Maker unable to issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[0].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef AIN deal with issued facilities is submitted to UKEF, user cancel deal in the past in TFM. Maker unable to issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[1].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef AIN deal with unissued facilities is submitted to UKEF, user cancel deal in the future in TFM. Maker unable to issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[2].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef AIN deal with unissued facilities is submitted to UKEF, user cancel deal in the past in TFM. Maker unable to issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[3].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with issued facilities is submitted to UKEF, user cancel deal in TFM. Maker unable to issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[4].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with issued facilities is submitted to UKEF, user cancel deal in the past in TFM. Maker unable to issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[5].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with unissued facilities is submitted to UKEF, user cancel deal in the future in TFM. Maker unable issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[6].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });

    it('Gef MIN deal with unissued facilities is submitted to UKEF, user cancel deal in the future TFM. Maker unable issue facility on portal', () => {
      gefPages.applicationDetails.visit(dealIdsWithEffectiveDate[7].id);
      gefPages.applicationPreview.unissuedFacilitiesHeader().should('not.exist');
    });
  });
});
