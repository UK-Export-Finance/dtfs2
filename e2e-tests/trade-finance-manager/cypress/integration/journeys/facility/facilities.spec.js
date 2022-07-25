import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1 } from '../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';
import partials from '../../partials';
import page from '../../pages';

context('Facility page', () => {
  let dealOne;
  let dealTwo;
  const dealOneFacilities = [];
  const dealTwoFacilities = [];

  before(() => {
    cy.deleteTfmDeals();
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealOne = insertedDeal;
      const { dealType, mockFacilities } = MOCK_DEAL_AIN;
      mockFacilities[0].value = '1234567890.1';

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
    cy.login(T1_USER_1);
  });

  after(() => {
    cy.deleteTfmDeals();
    cy.deleteDeals(dealOne._id, MOCK_MAKER_TFM);
    cy.deleteDeals(dealTwo._id, MOCK_MAKER_TFM);
    dealOneFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
    dealTwoFacilities.forEach((facility) => {
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
    page.facilitiesPage.facilityStageColumn().should('contain', 'Facility stage');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__ukefFacilityId"]').should('contain', '10000000');
    cy.get('@row1').find('[data-cy="facility__product"]').should('contain', dealTwo.dealType);
    cy.get('@row1').find('[data-cy="facility__type"]').should('contain', dealTwoFacilities[1].type);
    cy.get('@row1').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);
    cy.get('@row1').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234.00');
    cy.get('@row1').find('[data-cy="facility__coverEndDate"]').should('contain', '24 Sep 2020');
    cy.get('@row1').find('[data-cy="facility__facilityStage"]').should('contain', 'Unissued');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__ukefFacilityId"]').should('contain', '10000000');
    cy.get('@row2').find('[data-cy="facility__product"]').should('contain', dealTwo.dealType);
    cy.get('@row2').find('[data-cy="facility__type"]').should('contain', dealTwoFacilities[0].type);
    cy.get('@row2').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);
    cy.get('@row2').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234,567,890.1');
    cy.get('@row2').find('[data-cy="facility__coverEndDate"]').should('contain', '20 Oct 2022');
    cy.get('@row2').find('[data-cy="facility__facilityStage"]').should('contain', 'Issued');
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
    const searchString = '10000000';
    page.facilitiesPage.searchFormInput().type(searchString);
    page.facilitiesPage.searchFormSubmitButton().click();

    page.facilitiesPage.dealsTableRows().should('have.length', 4);
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

  it('sorts all columns based on Product column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.dataTypeColumn().find('button').click();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__type"]').should('contain', dealTwoFacilities[0].type);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__type"]').should('contain', dealOneFacilities[0].type);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__type"]').should('contain', dealTwoFacilities[1].type);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__type"]').should('contain', dealOneFacilities[1].type);
  });

  it('sorts all columns based on Product column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.dataTypeColumn().find('button').dblclick();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__type"]').should('contain', dealOneFacilities[1].type);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__type"]').should('contain', dealTwoFacilities[1].type);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__type"]').should('contain', dealOneFacilities[0].type);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__type"]').should('contain', dealTwoFacilities[0].type);
  });

  it('sorts all columns based on Exporter column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.exporterColumn().find('button').click();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__companyName"]').should('contain', dealOne.exporter.companyName);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__companyName"]').should('contain', dealOne.exporter.companyName);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);
  });

  it('sorts all columns based on Exporter column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.exporterColumn().find('button').dblclick();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__companyName"]').should('contain', dealTwo.exporter.companyName);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__companyName"]').should('contain', dealOne.exporter.companyName);

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__companyName"]').should('contain', dealOne.exporter.companyName);
  });

  it('sorts all columns based on Value column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.valueColumn().find('button').click();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234.00');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234.00');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234,567,890.1');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234,567,890.1');
  });

  it('sorts all columns based on Value column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.valueColumn().find('button').dblclick();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234,567,890.1');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234,567,890.1');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234.00');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__facilityValue"]').should('contain', 'GBP 1,234.00');
  });

  it('sorts all columns based on Cover End Date column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.coverEndDateColumn().find('button').click();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__coverEndDate"]').should('contain', '24 Sep 2020');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__coverEndDate"]').should('contain', '24 Sep 2020');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__coverEndDate"]').should('contain', '20 Oct 2022');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__coverEndDate"]').should('contain', '20 Oct 2022');
  });

  it('sorts all columns based on Cover End Date column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities'));

    page.facilitiesPage.coverEndDateColumn().find('button').dblclick();

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(1).as('row1');
    cy.get('@row1').find('[data-cy="facility__coverEndDate"]').should('contain', '20 Oct 2022');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(2).as('row2');
    cy.get('@row2').find('[data-cy="facility__coverEndDate"]').should('contain', '20 Oct 2022');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(3).as('row3');
    cy.get('@row3').find('[data-cy="facility__coverEndDate"]').should('contain', '24 Sep 2020');

    page.facilitiesPage.tfmFacilitiesTable().find('.govuk-table__row').eq(4).as('row4');
    cy.get('@row4').find('[data-cy="facility__coverEndDate"]').should('contain', '24 Sep 2020');
  });
});
