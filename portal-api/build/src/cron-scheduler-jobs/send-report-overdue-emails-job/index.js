"use strict";
const tslib_1 = require("tslib");
const { isSameDay, format } = require('date-fns');
const { getFormattedReportPeriod, getReportOverdueChaserDate, getFormattedReportDueDate, sendEmailToAllBanksWhereReportNotReceived, } = require('../helpers/utilisation-report-helpers');
const sendEmail = require('../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../constants/email-template-ids');
const { UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE } = process.env;
const EMAIL_DESCRIPTION = 'GEF utilisation report overdue';
/**
 * Attempts to send the emails if the report for the current period is overdue
 * a number of business days (the 'chaser date') after the original due date
 */
const sendEmailsOnReportOverdueChaserDate = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.info(`Checking if ${EMAIL_DESCRIPTION} emails should be sent today`);
    const today = new Date();
    const reportOverdueChaserDate = yield getReportOverdueChaserDate();
    if (isSameDay(today, reportOverdueChaserDate)) {
        const reportPeriod = getFormattedReportPeriod();
        const reportDueDate = yield getFormattedReportDueDate();
        yield sendEmailToAllBanksWhereReportNotReceived({
            emailDescription: EMAIL_DESCRIPTION,
            sendEmailCallback: (_a) => tslib_1.__awaiter(void 0, [_a], void 0, function* ({ emailAddress, recipient }) {
                return sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_OVERDUE, emailAddress, {
                    recipient,
                    reportPeriod,
                    reportDueDate,
                });
            }),
        });
    }
    else {
        const formattedReportOverdueChaserDate = format(reportOverdueChaserDate, 'dd-MMM-yy');
        console.info(`Not sending ${EMAIL_DESCRIPTION} emails - report overdue chaser is not due today (is/was due on ${formattedReportOverdueChaserDate})`);
    }
});
/**
 * @type {import('@ukef/dtfs2-common').CronSchedulerJob}
 */
const sendReportOverdueEmailsJob = {
    cronExpression: UTILISATION_REPORT_OVERDUE_EMAIL_SCHEDULE,
    description: 'Email banks to notify that this months GEF utilisation report is overdue',
    task: sendEmailsOnReportOverdueChaserDate,
};
module.exports = { sendReportOverdueEmailsJob };
