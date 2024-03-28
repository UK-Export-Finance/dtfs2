import { format, subMonths } from 'date-fns';
import { MonthAndYear, OneIndexedMonth, PaymentOfficerTeam, ReportPeriod, getCurrentReportPeriodForBankSchedule, getOneIndexedMonth } from '@ukef/dtfs2-common';
import externalApi from '../../external-api/api';
import api from '../../v1/api';
import { getBusinessDayOfMonth } from '../../utils/date';
import { isValidEmail } from '../../utils/string';
import { BANK_HOLIDAY_REGION } from '../../constants/bank-holiday-region';
import { BankResponse } from '../../v1/api-response-types';

export type SendEmailCallback = (emailAddress: string, recipient: string, formattedReportPeriod: string) => Promise<void>;

const DEFAULT_PAYMENT_OFFICER_TEAM_NAME = 'Team';

/**
 * Returns the utilisation report due date for the current month
 */
export const getReportDueDate = async (): Promise<Date> => {
  const bankHolidays = await externalApi.bankHolidays.getBankHolidayDatesForRegion(BANK_HOLIDAY_REGION.ENGLAND_AND_WALES);
  const businessDay = Number.parseInt(process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH!, 10);
  const dateInReportMonth = new Date();
  return getBusinessDayOfMonth(dateInReportMonth, bankHolidays, businessDay);
};

/**
 * Returns the utilisation report due date for the current month in 'd MMMM yyyy' format
 */
export const getFormattedReportDueDate = async (): Promise<string> => {
  const reportDueDate = await getReportDueDate();
  return format(reportDueDate, 'd MMMM yyyy');
};

/**
 * Returns the utilisation report chaser date for the current month - i.e. the date that a follow-up email should be
 * sent to the bank to chase a report if not received by the due date
 */
export const getReportOverdueChaserDate = async (): Promise<Date> => {
  const bankHolidays = await externalApi.bankHolidays.getBankHolidayDatesForRegion(BANK_HOLIDAY_REGION.ENGLAND_AND_WALES);
  const businessDay = Number.parseInt(process.env.UTILISATION_REPORT_OVERDUE_CHASER_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH!, 10);
  const dateInReportMonth = new Date();
  return getBusinessDayOfMonth(dateInReportMonth, bankHolidays, businessDay);
};

/**
 * Returns the given month and year formatted in the 'MMMM yyyy' format.
 */
const formatMonthAndYear = (monthAndYear: MonthAndYear): string => format(new Date(`${monthAndYear.year}-${monthAndYear.month}`), 'MMMM yyyy');

/**
 * Returns the given month and year formatted in the 'MMMM yyyy' format.
 */
const formatMonth = (month: OneIndexedMonth): string => format(new Date(`2023-${month}`), 'MMMM');

/**
 * Returns the given report period as a string.
 * For a single month this is in 'MMMM yyyy' format.
 * For a period of more than one month this is in the 'MMMM yyyy - MMMM yyyy' format.
 */
export const getFormattedReportPeriod = (reportPeriod: ReportPeriod): string => {
  if (reportPeriod.start.month === reportPeriod.end.month && reportPeriod.start.year === reportPeriod.end.year) {
    return formatMonthAndYear(reportPeriod.end);
  }
  if (reportPeriod.start.year === reportPeriod.end.year) {
    return `${formatMonth(reportPeriod.start.month)} to ${formatMonthAndYear(reportPeriod.end)}`;
  }
  return `${formatMonthAndYear(reportPeriod.start)} to ${formatMonthAndYear(reportPeriod.end)}`;
};

/**
 * Checks if a utilisation report has already been submitted by the specified bank for the specified reporting period
 */
export const getIsReportDue = async (bankId: string, reportPeriod: ReportPeriod): Promise<boolean> => {
  const reportsInReportPeriod = await api.getUtilisationReports(bankId, {
    reportPeriod,
  });

  if (reportsInReportPeriod.length !== 1) {
    throw new Error(
      `Expected to find one report for bank (id: ${bankId}) for report period ${getFormattedReportPeriod(reportPeriod)} but found ${
        reportsInReportPeriod.length
      }`,
    );
  }

  return reportsInReportPeriod[0].status === 'REPORT_NOT_RECEIVED';
};

/**
 * Get the email recipient from the bank specific paymentOfficerTeam or fall back to a generic default
 */
export const getEmailRecipient = (paymentOfficerTeam: PaymentOfficerTeam, bankName: string): string => {
  if (!paymentOfficerTeam?.teamName) {
    console.warn(`Bank '${bankName}' missing a payment officer team name. Using default '${DEFAULT_PAYMENT_OFFICER_TEAM_NAME}'`);
    return DEFAULT_PAYMENT_OFFICER_TEAM_NAME;
  }

  return paymentOfficerTeam.teamName;
};

/**
 * Checks if the given one indexed month is the previous calendar month
 */
const isPreviousCalendarMonth = (month: OneIndexedMonth): boolean => {
  const submissionMonthDate = new Date();
  const previousMonthDate = subMonths(submissionMonthDate, 1);
  return month === getOneIndexedMonth(previousMonthDate);
};

/**
 * Sends the email to the specified bank when a valid payment officer team email is present
 * @param emailDescription {string} - a description of the email (used for logging)
 * @param sendEmailCallback {SendEmailCallback} - callback function that sends the required email.
 *   The callback is provided the following argument `{ emailAddress: string; recipient: string }`,
 *   extracted from the provided bank.
 * @param bank {object} - the bank to send the email to
 * @returns {Promise<void>}
 */
const sendEmailForBank = async (
  emailDescription: string,
  formattedReportPeriod: string,
  sendEmailCallback: SendEmailCallback,
  bank: BankResponse,
): Promise<void> => {
  const { name: bankName, paymentOfficerTeam, id: bankId } = bank;
  try {
    const paymentOfficerTeamEmails = paymentOfficerTeam?.emails;

    if (!Array.isArray(paymentOfficerTeamEmails) || !paymentOfficerTeamEmails.length) {
      console.warn(`Not sending ${emailDescription} email to '${bankName}' - paymentOfficerTeam.emails property against bank is not an array or is empty`);
      return;
    }
    await Promise.all(
      paymentOfficerTeamEmails.map(async (paymentOfficerTeamEmail) => {
        if (!isValidEmail(paymentOfficerTeamEmail)) {
          console.error(`Failed to send ${emailDescription} email to '${paymentOfficerTeamEmail}' - invalid payment officer email`);
        } else {
          await sendEmailCallback(paymentOfficerTeamEmail, getEmailRecipient(paymentOfficerTeam, bankName), formattedReportPeriod);
          console.info(`Successfully sent '${emailDescription}' email to '${bankName}' (bank ID: ${bankId})`);
        }
      }),
    );
  } catch (error) {
    console.error(`Failed to send ${emailDescription} email for bank '${bankName}':`, error);
  }
};

/**
 * For a given bank, check if a utilisation report has been received for the current reporting period
 * then, where not yet received, attempts to call the provided callback function to send the required email
 * @param emailDescription {string} - a description of the email (used for logging)
 * @param sendEmailCallback {SendEmailCallback} - callback function that sends the required email.
 *   The callback is provided the following argument `{ emailAddress: string; recipient: string }`,
 *   extracted from the provided bank.
 * @returns {Promise<void>}
 */
const sendEmailToBankIfReportNotReceived = async (bank: BankResponse, emailDescription: string, sendEmailCallback: SendEmailCallback): Promise<void> => {
  const { name: bankName, id: bankId, utilisationReportPeriodSchedule: schedule } = bank;
  const currentReportingPeriodForBank = getCurrentReportPeriodForBankSchedule(schedule);
  const formattedReportPeriod = getFormattedReportPeriod(currentReportingPeriodForBank);

  if (isPreviousCalendarMonth(currentReportingPeriodForBank.end.month)) {
    const isReportDue = await getIsReportDue(bankId, currentReportingPeriodForBank);

    if (isReportDue) {
      await sendEmailForBank(emailDescription, formattedReportPeriod, sendEmailCallback, bank);
    } else {
      console.info(
        `Not sending '${emailDescription}' email to '${bankName}' (bank ID: ${bankId}) - report has already been submitted for ${formattedReportPeriod} report period`,
      );
    }
  } else {
    console.info(
      `Not sending '${emailDescription}' email to '${bankName}' (bank ID: ${bankId}) - report is not due this month, current reporting period for bank is ${formattedReportPeriod}`,
    );
  }
};

/**
 * For all banks, checks if the current utilisation report period for bank is in it's submission period and
 * if so if utilisation report has been received for the current reporting period
 * then, where not yet received, attempts to call the provided callback function to send the required email
 */
export const sendEmailToAllBanksWhereReportNotReceived = async ({
  emailDescription,
  sendEmailCallback,
}: {
  emailDescription: string;
  sendEmailCallback: SendEmailCallback;
}): Promise<void> => {
  console.info(`Attempting to send ${emailDescription} emails`);

  const banks = await api.getAllBanks();
  const banksVisibleInTfmUtilisationReports = banks.filter((bank) => bank.isVisibleInTfmUtilisationReports);

  for (const bank of banksVisibleInTfmUtilisationReports) {
    try {
      await sendEmailToBankIfReportNotReceived(bank, emailDescription, sendEmailCallback);
    } catch (error) {
      console.error(`Failed to send '${emailDescription}' email to '${bank.name}' (bank ID: ${bank.id})`, error);
    }
  }

  console.info(`Finished sending '${emailDescription}' emails`);
};
