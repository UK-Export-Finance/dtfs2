"use strict";
const tslib_1 = require("tslib");
const { format, isSameDay } = require('date-fns');
const { getReportDueDate, getFormattedReportPeriod, sendEmailToAllBanksWhereReportNotReceived } = require('../helpers/utilisation-report-helpers');
const sendEmail = require('../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../constants/email-template-ids');
const { UTILISATION_REPORT_DUE_EMAIL_SCHEDULE } = process.env;
const EMAIL_DESCRIPTION = 'GEF utilisation report due';
/**
 * Attempts to send the emails if the report for the current period is due today
 */
const sendEmailsOnReportDueDate = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    console.info(`Checking if ${EMAIL_DESCRIPTION} emails should be sent today`);
    const today = new Date();
    const reportDueDate = yield getReportDueDate();
    if (isSameDay(today, reportDueDate)) {
        const reportPeriod = getFormattedReportPeriod();
        yield sendEmailToAllBanksWhereReportNotReceived({
            emailDescription: EMAIL_DESCRIPTION,
            sendEmailCallback: (_a) => tslib_1.__awaiter(void 0, [_a], void 0, function* ({ emailAddress, recipient }) {
                return sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_DUE_TODAY, emailAddress, {
                    recipient,
                    reportPeriod,
                });
            }),
        });
    }
    else {
        const formattedReportDueDate = format(reportDueDate, 'dd-MMM-yy');
        console.info(`Not sending ${EMAIL_DESCRIPTION} emails - report is not due today (is/was due on ${formattedReportDueDate})`);
    }
});
/**
 * @type {import('@ukef/dtfs2-common').CronSchedulerJob}
 */
const sendReportDueEmailsJob = {
    cronExpression: UTILISATION_REPORT_DUE_EMAIL_SCHEDULE,
    description: 'Email banks to notify that this months GEF utilisation report has not yet been received and is due today',
    task: sendEmailsOnReportDueDate,
};
module.exports = { sendReportDueEmailsJob };
