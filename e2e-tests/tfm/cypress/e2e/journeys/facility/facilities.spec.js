import { ALL_CURRENCIES, FACILITY_STAGE, TFM_FACILITY_STAGE } from '@ukef/dtfs2-common';
import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../fixtures/deal-MIA';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { oneMonth } from '../../../../../e2e-fixtures/dateConstants';
import { caseSummary } from '../../partials';
import pages from '../../pages';
import CONSTANTS from '../../../fixtures/constants';

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

  it('should renders all facilities from TFM', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // Facilities page table column headings
    pages.facilitiesPage.facilitiesTable.headings.ukefFacilityId().contains('Facility ID');
    pages.facilitiesPage.facilitiesTable.headings.ukefFacilityId().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.facilitiesPage.facilitiesTable.headings.dealType().contains('Product');
    pages.facilitiesPage.facilitiesTable.headings.type().contains('Type');
    pages.facilitiesPage.facilitiesTable.headings.companyName().contains('Exporter');
    pages.facilitiesPage.facilitiesTable.headings.value().contains('Value (export currency)');
    pages.facilitiesPage.facilitiesTable.headings.coverEndDate().contains('Cover end date');
    pages.facilitiesPage.facilitiesTable.headings.facilityStage().contains('Facility stage');

    // 3 mock facilities inserted per deal (AIN and MIA)
    const totalFacilities = 6;

    // Common properties
    for (let i = 0; i < totalFacilities; i += 1) {
      // Facility ID
      pages.facilitiesPage.facilityIdCell(i).contains('1000000');

      // Product
      pages.facilitiesPage.dealTypeCell(i).contains(dealOne.dealType);

      // Exporter
      pages.facilitiesPage.companyNameCell(i).contains('Mock company name');
    }

    // Unique properties

    // Mock facility one
    // Type
    pages.facilitiesPage.typeCell(0).contains(CONSTANTS.FACILITY_TYPE.BOND);
    // Value
    pages.facilitiesPage.valueCell(0).contains(`${ALL_CURRENCIES.GBP} 12,345.00`);
    // Cover end date
    pages.facilitiesPage.coverEndDateCell(0).contains(oneMonth.dd_MMM_yyyy);
    // Facility stage
    pages.facilitiesPage.facilityStageCell(0).contains(TFM_FACILITY_STAGE.ISSUED);

    // Mock facility two
    // Type
    pages.facilitiesPage.typeCell(1).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    // Value
    pages.facilitiesPage.valueCell(1).contains(`${ALL_CURRENCIES.GBP} 1,234.00`);
    // Cover end date
    pages.facilitiesPage.coverEndDateCell(1).contains('24 Sep 2020');
    // Facility stage
    pages.facilitiesPage.facilityStageCell(1).contains(TFM_FACILITY_STAGE.UNISSUED);

    // Mock facility three
    // Type
    pages.facilitiesPage.typeCell(2).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    // Value
    pages.facilitiesPage.valueCell(2).contains(`${ALL_CURRENCIES.AUD} 12,345.00`);
    // Cover end date
    pages.facilitiesPage.coverEndDateCell(2).contains(oneMonth.dd_MMM_yyyy);
    // Facility stage
    pages.facilitiesPage.facilityStageCell(2).contains(TFM_FACILITY_STAGE.ISSUED);

    // Mock facility four
    // Type
    pages.facilitiesPage.typeCell(3).contains(CONSTANTS.FACILITY_TYPE.BOND);
    // Value
    pages.facilitiesPage.valueCell(3).contains(`${ALL_CURRENCIES.GBP} 12,345.00`);
    // Cover end date
    pages.facilitiesPage.coverEndDateCell(3).contains(oneMonth.dd_MMM_yyyy);
    // Facility stage
    pages.facilitiesPage.facilityStageCell(3).contains(TFM_FACILITY_STAGE.ISSUED);

    // Mock facility five
    // Type
    pages.facilitiesPage.typeCell(4).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    // Value
    pages.facilitiesPage.valueCell(4).contains(`${ALL_CURRENCIES.GBP} 1,234.00`);
    // Cover end date
    pages.facilitiesPage.coverEndDateCell(4).contains('24 Sep 2020');
    // Facility stage
    pages.facilitiesPage.facilityStageCell(4).contains(TFM_FACILITY_STAGE.UNISSUED);

    // Mock facility siz
    // Type
    pages.facilitiesPage.typeCell(5).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    // Value
    pages.facilitiesPage.valueCell(5).contains(`${ALL_CURRENCIES.AUD} 12,345.00`);
    // Cover end date
    pages.facilitiesPage.coverEndDateCell(5).contains(oneMonth.dd_MMM_yyyy);
    // Facility stage
    pages.facilitiesPage.facilityStageCell(5).contains(TFM_FACILITY_STAGE.ISSUED);
  });

  it('should renders case summary with deal data', () => {
    const facilityId = dealOneFacilities[0]._id;
    cy.visit(relative(`/case/${dealOne._id}/facility/${facilityId}`));
    // check that a couple of case summary elements have data
    // (no need to check all in E2E test)
    caseSummary.ukefDealId().should('be.visible');

    cy.assertText(caseSummary.ukefDealId(), MOCK_DEAL_AIN.details.ukefDealId);

    caseSummary.exporterName().should('be.visible');

    cy.assertText(caseSummary.exporterName(), MOCK_DEAL_AIN.exporter.companyName);
  });

  it('should performs a search query based on Facility ID', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));
    const searchString = '1000000';
    cy.keyboardInput(pages.facilitiesPage.searchFormInput(), searchString);
    cy.clickSubmitButton();

    cy.checkFacilitiesTableRowsTotal(6);
  });

  it('should performs a search query based on AIN Export name', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));
    const searchString = MOCK_DEAL_AIN.exporter.companyName;

    cy.keyboardInput(pages.facilitiesPage.searchFormInput(), searchString);
    cy.clickSubmitButton();

    cy.checkFacilitiesTableRowsTotal(6);
  });

  it('should sorts all columns based on Product column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.dealTypeSortButton().click();

    pages.facilitiesPage.dealTypeCell(0).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(1).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(2).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(3).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(4).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(5).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
  });

  it('should sorts all columns based on Product column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.dealTypeSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.dealTypeSortButton().click();

    pages.facilitiesPage.dealTypeCell(0).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(1).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(2).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(3).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(4).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
    pages.facilitiesPage.dealTypeCell(5).contains(CONSTANTS.DEAL_TYPE.BSS_EWCS);
  });

  it('should sorts all columns based on type column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.typeSortButton().click();

    pages.facilitiesPage.typeCell(0).contains(CONSTANTS.FACILITY_TYPE.BOND);
    pages.facilitiesPage.typeCell(1).contains(CONSTANTS.FACILITY_TYPE.BOND);
    pages.facilitiesPage.typeCell(2).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    pages.facilitiesPage.typeCell(3).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    pages.facilitiesPage.typeCell(4).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    pages.facilitiesPage.typeCell(5).contains(CONSTANTS.FACILITY_TYPE.LOAN);
  });

  it('should sorts all columns based on type column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.typeSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.typeSortButton().click();

    pages.facilitiesPage.typeCell(0).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    pages.facilitiesPage.typeCell(1).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    pages.facilitiesPage.typeCell(2).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    pages.facilitiesPage.typeCell(3).contains(CONSTANTS.FACILITY_TYPE.LOAN);
    pages.facilitiesPage.typeCell(4).contains(CONSTANTS.FACILITY_TYPE.BOND);
    pages.facilitiesPage.typeCell(5).contains(CONSTANTS.FACILITY_TYPE.BOND);
  });

  it('should sorts all columns based on Exporter column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.companyNameSortButton().click();

    pages.facilitiesPage.companyNameCell(0).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(1).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(2).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(3).contains(dealTwo.exporter.companyName);
    pages.facilitiesPage.companyNameCell(4).contains(dealTwo.exporter.companyName);
    pages.facilitiesPage.companyNameCell(5).contains(dealTwo.exporter.companyName);
  });

  it('should sorts all columns based on Exporter column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.companyNameSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.companyNameSortButton().click();

    pages.facilitiesPage.companyNameCell(0).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(1).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(2).contains(dealOne.exporter.companyName);
    pages.facilitiesPage.companyNameCell(3).contains(dealTwo.exporter.companyName);
    pages.facilitiesPage.companyNameCell(4).contains(dealTwo.exporter.companyName);
    pages.facilitiesPage.companyNameCell(5).contains(dealTwo.exporter.companyName);
  });

  it('should sorts all columns based on Value column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.valueSortButton().click();

    pages.facilitiesPage.valueCell(0).contains(`${ALL_CURRENCIES.GBP} 1,234.00`);
    pages.facilitiesPage.valueCell(1).contains(`${ALL_CURRENCIES.GBP} 1,234.00`);
    pages.facilitiesPage.valueCell(2).contains(`${ALL_CURRENCIES.GBP} 12,345.00`);
    pages.facilitiesPage.valueCell(3).contains(`${ALL_CURRENCIES.AUD} 12,345.00`);
    pages.facilitiesPage.valueCell(4).contains(`${ALL_CURRENCIES.GBP} 12,345.00`);
    pages.facilitiesPage.valueCell(5).contains(`${ALL_CURRENCIES.AUD} 12,345.00`);
  });

  it('should sorts all columns based on Value column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.valueSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.valueSortButton().click();

    pages.facilitiesPage.valueCell(0).contains(`${ALL_CURRENCIES.GBP} 12,345.00`);
    pages.facilitiesPage.valueCell(1).contains(`${ALL_CURRENCIES.AUD} 12,345.00`);
    pages.facilitiesPage.valueCell(2).contains(`${ALL_CURRENCIES.GBP} 12,345.00`);
    pages.facilitiesPage.valueCell(3).contains(`${ALL_CURRENCIES.AUD} 12,345.00`);
    pages.facilitiesPage.valueCell(4).contains(`${ALL_CURRENCIES.GBP} 1,234.00`);
    pages.facilitiesPage.valueCell(5).contains(`${ALL_CURRENCIES.GBP} 1,234.00`);
  });

  it('should sorts all columns based on Cover End Date column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.coverEndDateSortButton().click();

    pages.facilitiesPage.coverEndDateCell(0).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(1).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(2).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(3).contains(oneMonth.dd_MMM_yyyy);
    pages.facilitiesPage.coverEndDateCell(4).contains(oneMonth.dd_MMM_yyyy);
    pages.facilitiesPage.coverEndDateCell(5).contains(oneMonth.dd_MMM_yyyy);
  });

  it('should sorts all columns based on Cover End Date column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.coverEndDateSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.coverEndDateSortButton().click();

    pages.facilitiesPage.coverEndDateCell(0).contains(oneMonth.dd_MMM_yyyy);
    pages.facilitiesPage.coverEndDateCell(1).contains(oneMonth.dd_MMM_yyyy);
    pages.facilitiesPage.coverEndDateCell(2).contains(oneMonth.dd_MMM_yyyy);
    pages.facilitiesPage.coverEndDateCell(3).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(4).contains('24 Sep 2020');
    pages.facilitiesPage.coverEndDateCell(5).contains('24 Sep 2020');
  });

  it('should sorts all columns based on Facility Stage column (ASC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    pages.facilitiesPage.facilitiesTable.headings.facilityStageSortButton().click();

    pages.facilitiesPage.facilityStageCell(0).contains(FACILITY_STAGE.ISSUED);
    pages.facilitiesPage.facilityStageCell(1).contains(FACILITY_STAGE.ISSUED);
    pages.facilitiesPage.facilityStageCell(2).contains(FACILITY_STAGE.ISSUED);
    pages.facilitiesPage.facilityStageCell(3).contains(FACILITY_STAGE.ISSUED);
    pages.facilitiesPage.facilityStageCell(4).contains(FACILITY_STAGE.UNISSUED);
    pages.facilitiesPage.facilityStageCell(5).contains(FACILITY_STAGE.UNISSUED);
  });

  it('should sorts all columns based on Facility Stage column (DESC)', () => {
    cy.visit(relative('/facilities'));
    cy.url().should('eq', relative('/facilities/0'));

    // click once for `ascending` order
    pages.facilitiesPage.facilitiesTable.headings.facilityStageSortButton().click();
    // click again for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.facilityStageSortButton().click();

    pages.facilitiesPage.facilityStageCell(0).contains(FACILITY_STAGE.UNISSUED);
    pages.facilitiesPage.facilityStageCell(1).contains(FACILITY_STAGE.UNISSUED);
    pages.facilitiesPage.facilityStageCell(2).contains(FACILITY_STAGE.ISSUED);
    pages.facilitiesPage.facilityStageCell(3).contains(FACILITY_STAGE.ISSUED);
    pages.facilitiesPage.facilityStageCell(4).contains(FACILITY_STAGE.ISSUED);
    pages.facilitiesPage.facilityStageCell(5).contains(FACILITY_STAGE.ISSUED);
  });
});
