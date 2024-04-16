"use strict";
const tslib_1 = require("tslib");
const { NotifyClient } = require('notifications-node-client');
require('dotenv').config();
const notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);
const sendEmail = (templateId, sendToEmailAddress, emailVariables) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const personalisation = emailVariables;
    return notifyClient
        .sendEmail(templateId, sendToEmailAddress, { personalisation, reference: null })
        .catch((error) => {
        var _a;
        console.error('Portal API - Failed to send email %o', (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
        return { status: 500, data: 'Failed to send an email' };
    });
});
module.exports = sendEmail;
