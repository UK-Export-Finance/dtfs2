import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';

context(`users can filter payment details by facility id and payment reference and currency`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [utilisationReport]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`/utilisation-reports/${reportId}`);
  });

  it('should display all the payments attached to the utilisation report', () => {
    const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
    const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();
    const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withFacilityId('33333333').build();

    const firstPayment = PaymentEntityMockBuilder.forCurrency('GBP')
      .withId(2)
      .withAmount(100)
      .withReference('ABC')
      .withFeeRecords([firstFeeRecord, secondFeeRecord])
      .build();
    const secondPayment = PaymentEntityMockBuilder.forCurrency('GBP').withId(3).withAmount(200).withReference('DEF').withFeeRecords([thirdFeeRecord]).build();

    const payments = [firstPayment, secondPayment];

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord, thirdFeeRecord]);
    cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, payments);

    cy.reload();

    pages.utilisationReportPage.paymentDetailsLink().click();

    payments.forEach(({ id: paymentId, currency, amount, reference, feeRecords }) => {
      feeRecords.forEach(({ id: feeRecordId, facilityId }, index) => {
        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(paymentId, feeRecordId).should('exist');

        const isFirstFeeRecordRow = index === 0;

        if (isFirstFeeRecordRow) {
          cy.assertText(
            pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.paymentCurrencyAndAmount(paymentId, feeRecordId),
            `${currency} ${amount.toFixed(2)}`,
          );

          cy.assertText(pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.paymentReference(paymentId, feeRecordId), reference);
        }

        cy.assertText(pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.facilityId(paymentId, feeRecordId), facilityId);
      });
    });
  });
});
