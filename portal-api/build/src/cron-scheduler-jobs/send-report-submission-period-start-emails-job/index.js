"use strict";
const tslib_1 = require("tslib");
const sendEmail = require('../../external-api/send-email');
const EMAIL_TEMPLATE_IDS = require('../../constants/email-template-ids');
const { getFormattedReportDueDate, getFormattedReportPeriod, sendEmailToAllBanksWhereReportNotReceived } = require('../helpers/utilisation-report-helpers');
const { UTILISATION_REPORT_SUBMISSION_PERIOD_START_EMAIL_SCHEDULE } = process.env;
const EMAIL_DESCRIPTION = 'GEF utilisation report submission period start';
/**
 * Attempts to send the email to all banks
 */
const sendEmails = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const reportPeriod = getFormattedReportPeriod();
    const reportDueDate = yield getFormattedReportDueDate();
    yield sendEmailToAllBanksWhereReportNotReceived({
        emailDescription: EMAIL_DESCRIPTION,
        sendEmailCallback: (_a) => tslib_1.__awaiter(void 0, [_a], void 0, function* ({ emailAddress, recipient }) {
            return sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_SUBMISSION_PERIOD_START, emailAddress, {
                recipient,
                reportPeriod,
                reportDueDate,
            });
        }),
    });
});
/**
 * @type {import('@ukef/dtfs2-common').CronSchedulerJob}
 */
const sendReportSubmissionPeriodStartEmailsJob = {
    cronExpression: UTILISATION_REPORT_SUBMISSION_PERIOD_START_EMAIL_SCHEDULE,
    description: 'Email banks to notify that the GEF utilisation report submission period has started',
    task: sendEmails,
};
module.exports = { sendReportSubmissionPeriodStartEmailsJob };
