import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';
import partials from '../../partials';
import page from '../../pages';

context('Facility page', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteTfmDeals(dealId);

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;
      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);
    });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
  });

  after(() => {
    cy.deleteTfmDeals(dealId);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('renders all facilities from TFM', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.ukefFacilityIdColumn().invoke('attr', 'aria-sort').should('contain', 'ascending');
    page.facilitiesPage.productColumn().should('contain', 'Product');
    page.facilitiesPage.dataTypeColumn().should('contain', 'Type');
    page.facilitiesPage.exporterColumn().should('contain', 'Exporter');
    page.facilitiesPage.valueColumn().should('contain', 'Value (export currency)');
    page.facilitiesPage.coverEndDateColumn().should('contain', 'Cover end date');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__ukefFacilityId"]').should('contain', '10000000002');
    cy.get('@row1').find('[data-cy="facility__product"]').should('contain', 'BSS/EWCS');
    cy.get('@row1').find('[data-cy="facility__facilityType"]').should('contain', 'bond');
    cy.get('@row1').find('[data-cy="facility__companyName"]').should('contain', 'Mock company');
    cy.get('@row1').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 12,345.00');
    cy.get('@row1').find('[data-cy="facility__coverEndDate"]').should('contain', '20 Oct 2020');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__ukefFacilityId"]').should('contain', '10000000003');
    cy.get('@row2').find('[data-cy="facility__product"]').should('contain', 'BSS/EWCS');
    cy.get('@row2').find('[data-cy="facility__facilityType"]').should('contain', 'loan');
    cy.get('@row2').find('[data-cy="facility__companyName"]').should('contain', 'Mock company');
    cy.get('@row2').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234.00');
    cy.get('@row2').find('[data-cy="facility__coverEndDate"]').should('contain', '24 Sep 2020');
  });

  it('renders case summary with deal data', () => {
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));
    // check that a couple of case summary elements have data
    // (no need to check all in E2E test)
    partials.caseSummary.ukefDealId().should('be.visible');
    partials.caseSummary.ukefDealId().invoke('text').then((text) => {
      expect(text.trim()).equal(MOCK_DEAL_AIN.details.ukefDealId);
    });

    partials.caseSummary.exporterName().should('be.visible');
    partials.caseSummary.exporterName().invoke('text').then((text) => {
      expect(text.trim()).equal(MOCK_DEAL_AIN.exporter.companyName);
    });
  });
});
