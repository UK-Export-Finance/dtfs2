import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';
import partials from '../../partials';
import page from '../../pages';

context('Facility page', () => {
  let dealOne;
  let dealTwo;
  const dealOneFacilities = [];
  const dealTwoFacilities = [];

  before(() => {
    cy.deleteTfmDeals(dealOne?._id);
    cy.deleteTfmDeals(dealTwo?._id);
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealOne = insertedDeal;
      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealOne._id, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealOneFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealOne._id, dealType);
    });

    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealTwo = insertedDeal;
      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealTwo._id, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealTwoFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealTwo._id, dealType);
    });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
  });

  after(() => {
    cy.deleteTfmDeals(dealOne?._id);
    cy.deleteTfmDeals(dealTwo?._id);
    dealOneFacilities.forEach((facility) => {
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
    cy.get('@row1').find('[data-cy="facility__ukefFacilityId"]').should('contain', '10000000006');
    cy.get('@row1').find('[data-cy="facility__product"]').should('contain', dealTwo.dealType);
    cy.get('@row1').find('[data-cy="facility__facilityType"]').should('contain', dealTwoFacilities[1].facilityType);
    cy.get('@row1').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);
    cy.get('@row1').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234.00');
    cy.get('@row1').find('[data-cy="facility__coverEndDate"]').should('contain', '24 Sep 2020');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__ukefFacilityId"]').should('contain', '10000000005');
    cy.get('@row2').find('[data-cy="facility__product"]').should('contain', dealTwo.dealType);
    cy.get('@row2').find('[data-cy="facility__facilityType"]').should('contain', dealTwoFacilities[0].facilityType);
    cy.get('@row2').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);
    cy.get('@row2').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 12,345.00');
    cy.get('@row2').find('[data-cy="facility__coverEndDate"]').should('contain', '20 Oct 2020');
  });

  it('renders case summary with deal data', () => {
    const facilityId = dealOneFacilities[0]._id;
    cy.visit(relative(`/case/${dealOne._id}/facility/${facilityId}`));
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

  it('performs a search query based on Facility ID', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));
    const searchString = '10000000002';
    page.facilitiesPage.searchFormInput().type(searchString);
    page.facilitiesPage.searchFormSubmitButton().click();

    page.facilitiesPage.dealsTableRows().should('have.length', 1);
  });

  it('performs a search query based on AIN Export name', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));
    const searchString = MOCK_DEAL_AIN.exporter.companyName;

    page.facilitiesPage.searchFormInput().type(searchString);
    page.facilitiesPage.searchFormSubmitButton().click();

    page.facilitiesPage.dealsTableRows().should('have.length', 2);
  });

  it('performs a secondary search query based on MIA Export name', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));
    const searchString = MOCK_DEAL_MIA.exporter.companyName;

    page.facilitiesPage.searchFormInput().type(searchString);
    page.facilitiesPage.searchFormSubmitButton().click();

    page.facilitiesPage.dealsTableRows().should('have.length', 2);
  });
});
