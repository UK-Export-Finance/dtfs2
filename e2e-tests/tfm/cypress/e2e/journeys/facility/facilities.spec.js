import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import partials from '../../partials';
import pages from '../../pages';

context('Facility page', () => {
  let dealOne;
  let dealTwo;
  const dealOneFacilities = [];
  const dealTwoFacilities = [];

  before(() => {
    cy.deleteTfmDeals();
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealOne = insertedDeal;
      const { dealType, mockFacilities } = MOCK_DEAL_AIN;
      mockFacilities[0].value = '1234567890.1';

      cy.createFacilities(dealOne._id, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealOneFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealOne._id, dealType, T1_USER_1);
    });

    cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
      dealTwo = insertedDeal;
      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealTwo._id, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealTwoFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealTwo._id, dealType, T1_USER_1);
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
  });

  after(() => {
    cy.deleteTfmDeals();
    cy.deleteDeals(dealOne._id, BANK1_MAKER1);
    cy.deleteDeals(dealTwo._id, BANK1_MAKER1);
    dealOneFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
    dealTwoFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('renders all facilities from TFM', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.ukefFacilityId().contains('Facility ID');
    pages.facilitiesPage.facilitiesTable.headings.ukefFacilityId().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.facilitiesPage.facilitiesTable.headings.dealType().contains('Product');
    pages.facilitiesPage.facilitiesTable.headings.type().contains('Type');
    pages.facilitiesPage.facilitiesTable.headings.companyName().contains('Exporter');
    pages.facilitiesPage.facilitiesTable.headings.value().contains('Value (export currency)');
    pages.facilitiesPage.facilitiesTable.headings.coverEndDate().contains('Cover end date');
    pages.facilitiesPage.facilitiesTable.headings.facilityStage().contains('Facility stage');

    for (let i = 0; i < 4; i += 1) {
      pages.facilitiesPage.facilityIdCell(i).contains('1000000');
      pages.facilitiesPage.dealTypeCell(i).contains(dealOne.dealType);

      const companyName = i < 2 ? dealOne.exporter.companyName : dealTwo.exporter.companyName;
      pages.facilitiesPage.companyNameCell(i).contains(companyName);
    }

    [0, 2].forEach((i) => {
      pages.facilitiesPage.typeCell(i).contains(dealOneFacilities[0].type);
      pages.facilitiesPage.valueCell(i).contains('GBP 1,234,567,890.1');
      pages.facilitiesPage.coverEndDateCell(i).contains(dateConstants.oneMonthFormattedShort);
      pages.facilitiesPage.facilityStageCell(i).contains('Issued');
    });

    [1, 3].forEach((i) => {
      pages.facilitiesPage.typeCell(i).contains(dealOneFacilities[1].type);
      pages.facilitiesPage.valueCell(i).contains('GBP 1,234.00');
      pages.facilitiesPage.coverEndDateCell(i).contains('24 Sep 2020');
      pages.facilitiesPage.facilityStageCell(i).contains('Unissued');
    });
  });

  it('renders case summary with deal data', () => {
    const facilityId = dealOneFacilities[0]._id;
    cy.visit(relative(`/case/${dealOne._id}/facility/${facilityId}`));
    // check that a couple of case summary elements have data
    // (no need to check all in E2E test)
    partials.caseSummary.ukefDealId().should('be.visible');
    partials.caseSummary
      .ukefDealId()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(MOCK_DEAL_AIN.details.ukefDealId);
      });

    partials.caseSummary.exporterName().should('be.visible');
    partials.caseSummary
      .exporterName()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal(MOCK_DEAL_AIN.exporter.companyName);
      });
  });

  it('performs a search query based on Facility ID', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));
    const searchString = '1000000';
    pages.facilitiesPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    cy.checkFacilitiesTableRowsTotal(4);
  });

  it('performs a search query based on AIN Export name', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));
    const searchString = MOCK_DEAL_AIN.exporter.companyName;

    pages.facilitiesPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    cy.checkFacilitiesTableRowsTotal(2);
  });

  it('performs a secondary search query based on MIA Export name', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));
    const searchString = MOCK_DEAL_MIA.exporter.companyName;

    pages.facilitiesPage.searchFormInput().type(searchString);
    cy.clickSubmitButton();

    cy.checkFacilitiesTableRowsTotal(2);
  });

  it('sorts all columns based on Product column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.typeSortButton().click();

    pages.facilitiesPage.typeCell(0).contains(dealTwoFacilities[0].type);
    pages.facilitiesPage.typeCell(1).contains(dealOneFacilities[0].type);
    pages.facilitiesPage.typeCell(2).contains(dealTwoFacilities[1].type);
    pages.facilitiesPage.typeCell(3).contains(dealOneFacilities[1].type);
  });

  it('sorts all columns based on Product column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.typeSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.typeSortButton().click();

    pages.facilitiesPage.typeCell(0).contains(dealOneFacilities[1].type);
    pages.facilitiesPage.typeCell(1).contains(dealTwoFacilities[1].type);
    pages.facilitiesPage.typeCell(2).contains(dealOneFacilities[0].type);
    pages.facilitiesPage.typeCell(3).contains(dealTwoFacilities[0].type);
  });

  it('sorts all columns based on Exporter column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.companyNameSortButton().click();

    pages.facilitiesPage.companyNameCell(0).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(1).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(2).contains(dealTwo.exporter.companyName);
    pages.facilitiesPage.companyNameCell(3).contains(dealTwo.exporter.companyName);
  });

  it('sorts all columns based on Exporter column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.companyNameSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.companyNameSortButton().click();

    pages.facilitiesPage.companyNameCell(0).contains(dealTwo.exporter.companyName);
    pages.facilitiesPage.companyNameCell(1).contains(dealTwo.exporter.companyName);
    pages.facilitiesPage.companyNameCell(2).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(3).contains(dealOne.exporter.companyName);
  });

  it('sorts all columns based on Value column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.valueSortButton().click();

    pages.facilitiesPage.valueCell(0).contains('GBP 1,234.00');
    pages.facilitiesPage.valueCell(1).contains('GBP 1,234.00');
    pages.facilitiesPage.valueCell(2).contains('GBP 1,234,567,890.1');
    pages.facilitiesPage.valueCell(3).contains('GBP 1,234,567,890.1');
  });

  it('sorts all columns based on Value column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.valueSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.valueSortButton().click();

    pages.facilitiesPage.valueCell(0).contains('GBP 1,234,567,890.1');
    pages.facilitiesPage.valueCell(1).contains('GBP 1,234,567,890.1');
    pages.facilitiesPage.valueCell(2).contains('GBP 1,234.00');
    pages.facilitiesPage.valueCell(3).contains('GBP 1,234.00');
  });

  it('sorts all columns based on Cover End Date column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.coverEndDateSortButton().click();

    pages.facilitiesPage.coverEndDateCell(0).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(1).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(2).contains(dateConstants.oneMonthFormattedShort);
    pages.facilitiesPage.coverEndDateCell(3).contains(dateConstants.oneMonthFormattedShort);
  });

  it('sorts all columns based on Cover End Date column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.coverEndDateSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.coverEndDateSortButton().click();

    pages.facilitiesPage.coverEndDateCell(0).contains(dateConstants.oneMonthFormattedShort);
    pages.facilitiesPage.coverEndDateCell(1).contains(dateConstants.oneMonthFormattedShort);
    pages.facilitiesPage.coverEndDateCell(2).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(3).contains('24 Sep 2020');
  });

  it('sorts all columns based on Facility Stage column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.facilityStageSortButton().click();

    pages.facilitiesPage.facilityStageCell(0).contains('Issued');
    pages.facilitiesPage.facilityStageCell(1).contains('Issued');
    pages.facilitiesPage.facilityStageCell(2).contains('Unissued');
    pages.facilitiesPage.facilityStageCell(3).contains('Unissued');
  });

  it('sorts all columns based on Facility Stage column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.facilityStageSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.facilityStageSortButton().click();

    pages.facilitiesPage.facilityStageCell(0).contains('Unissued');
    pages.facilitiesPage.facilityStageCell(1).contains('Unissued');
    pages.facilitiesPage.facilityStageCell(2).contains('Issued');
    pages.facilitiesPage.facilityStageCell(3).contains('Issued');
  });
});
