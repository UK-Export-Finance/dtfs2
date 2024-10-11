import {
  AMENDMENT_STATUS,
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('Users can view utilisation', () => {
  const BANK_ID = '961';
  const REPORT_ID = 1;
  const FEE_RECORD_ID_ONE = '11';
  const FEE_RECORD_ID_TWO = '22';
  const FACILITY_ID_ONE = '11111111';
  const FACILITY_ID_TWO = '22222222';

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);

    const tfmFacilityOne = {
      facilitySnapshot: {
        ukefFacilityId: FACILITY_ID_ONE,
        coverPercentage: 80,
        value: 1000000,
      },
    };
    const tfmFacilityTwo = {
      facilitySnapshot: {
        ukefFacilityId: FACILITY_ID_TWO,
        coverPercentage: 85,
        value: 200000,
      },
      amendments: [
        {
          value: 300000,
          status: AMENDMENT_STATUS.COMPLETED,
        },
      ],
    };

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityOne, tfmFacilityTwo]);

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
      .withId(REPORT_ID)
      .withBankId(BANK_ID)
      .build();
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_ONE)
      .withFacilityId(FACILITY_ID_ONE)
      .withExporter('Exporter 1')
      .withBaseCurrency(CURRENCY.GBP)
      .withFacilityUtilisation(500000)
      .withTotalFeesAccruedForThePeriod(300)
      .withTotalFeesAccruedForThePeriodCurrency(CURRENCY.EUR)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.JPY)
      .withPaymentExchangeRate(2)
      .withPaymentCurrency(CURRENCY.USD)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();

    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_TWO)
      .withFacilityId(FACILITY_ID_TWO)
      .withExporter('Exporter 2')
      .withBaseCurrency(CURRENCY.GBP)
      .withFacilityUtilisation(199999.99)
      .withTotalFeesAccruedForThePeriod(200)
      .withTotalFeesAccruedForThePeriodCurrency(CURRENCY.EUR)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentExchangeRate(2)
      .withPaymentCurrency(CURRENCY.USD)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordOne, feeRecordTwo]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);

    pages.utilisationReportPage.utilisationTabLink().click();
  });

  it('should render the utilisation for each fee record', () => {
    pages.utilisationReportPage.utilisationTab.utilisationTable.row(FEE_RECORD_ID_ONE).within(() => {
      cy.assertText(cy.get('[data-cy="facility-id"]'), FACILITY_ID_ONE);
      cy.assertText(cy.get('[data-cy="exporter"]'), 'Exporter 1');
      cy.assertText(cy.get('[data-cy="base-currency"]'), CURRENCY.GBP);
      cy.assertText(cy.get('[data-cy="value"]'), '1,000,000.00');
      cy.assertText(cy.get('[data-cy="utilisation"]'), '500,000.00');
      cy.assertText(cy.get('[data-cy="cover-percentage"]'), '80%');
      // 80% of 500,000 is 400,000
      cy.assertText(cy.get('[data-cy="exposure"]'), '400,000.00');
      cy.assertText(cy.get('[data-cy="fees-accrued"]'), `${CURRENCY.EUR} 300.00`);
      cy.assertText(cy.get('[data-cy="fees-payable"]'), `${CURRENCY.JPY} 100.00`);
    });

    pages.utilisationReportPage.utilisationTab.utilisationTable.row(FEE_RECORD_ID_TWO).within(() => {
      cy.assertText(cy.get('[data-cy="facility-id"]'), FACILITY_ID_TWO);
      cy.assertText(cy.get('[data-cy="exporter"]'), 'Exporter 2');
      cy.assertText(cy.get('[data-cy="base-currency"]'), CURRENCY.GBP);
      cy.assertText(cy.get('[data-cy="value"]'), '300,000.00');
      cy.assertText(cy.get('[data-cy="utilisation"]'), '199,999.99');
      cy.assertText(cy.get('[data-cy="cover-percentage"]'), '85%');
      // 85% of 199,999.99 is 169,999.9915
      cy.assertText(cy.get('[data-cy="exposure"]'), '169,999.99');
      cy.assertText(cy.get('[data-cy="fees-accrued"]'), `${CURRENCY.EUR} 200.00`);
      cy.assertText(cy.get('[data-cy="fees-payable"]'), `${CURRENCY.GBP} 100.00`);
    });
  });

  it('should be able to download report for offline viewing', () => {
    cy.assertText(pages.utilisationReportPage.utilisationTab.downloadReportLink(), 'Download the report submitted by the bank as a CSV');

    pages.utilisationReportPage.utilisationTab.downloadReportLink().click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/download`));
  });
});
