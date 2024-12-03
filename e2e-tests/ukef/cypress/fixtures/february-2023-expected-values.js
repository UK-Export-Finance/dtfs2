/**
 * These values need to be kept in line with the values in the files:
 * - valid-utilisation-report-February_2023_monthly.xlsx
 * - valid-utilisation-report-February_2023_monthly.csv
 * in the features folder as these are the files that are uploaded in this test file.
 *
 * These are to be used to assert that when the report is uploaded the values
 * are parsed and saved correctly.
 */
export const february2023ExpectedValues = {
  firstReportRow: {
    facilityId: '20001371',
    exporter: 'Exporter 1',
    utilisation: '761,579.37',
    /**
     * Fees paid to ukef for the period currency followed by fees paid to ukef for the period
     */
    reportedFees: 'GBP 123.00',
    /**
     * No payment currency provided so this is the same as reported fees.
     */
    reportedPayments: 'GBP 123.00',
    /**
     * No accrual currency provided so this takes the value:
     * base currency followed by total fees accrued for the period.
     */
    feesAccrued: 'GBP 123.00',
  },
  secondReportRow: {
    facilityId: '20001371',
    exporter: 'Exporter 2',
    utilisation: '761,579.37',
    /**
     * Fees paid to ukef for the period currency followed by fees paid to ukef for the period.
     */
    reportedFees: 'GBP 243.00',
    /**
     * The payment currency is the same as the fees paid to ukef for the period currency,
     * so the reported payments match the reported fees.
     */
    reportedPayments: 'GBP 243.00',
    /**
     * Accrual currency followed by total fees accrued for the period.
     */
    feesAccrued: 'GBP 150.00',
  },
  thirdReportRow: {
    facilityId: '20001371',
    exporter: 'Potato exporter',
    utilisation: '761,579.37',
    /**
     * Fees paid to ukef for the period currency followed by fees paid to ukef for the period.
     */
    reportedFees: 'EUR 45.00',
    /**
     * Payment currency is in GBP which is different to the fees paid to UKEF currency.
     * The payment currency exchange rate is 1.17.
     * So the reported payments = fees paid to ukef for the period / payment currency exchange rate
     *                          = 45 / 1.17
     *                          = 38.46
     */
    reportedPayments: 'GBP 38.46',
    /**
     * The accrual currency followed by total fees accrued for the period.
     */
    feesAccrued: 'JPY 45.00',
  },
};
