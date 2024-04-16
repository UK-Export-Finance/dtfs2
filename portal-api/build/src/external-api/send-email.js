"use strict";
const tslib_1 = require("tslib");
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const sendEmail = (templateId, sendToEmailAddress, emailVariables) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios({
            method: 'post',
            url: `${EXTERNAL_API_URL}/email`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': String(EXTERNAL_API_KEY),
            },
            data: {
                templateId,
                sendToEmailAddress,
                emailVariables,
            },
        });
        return data;
    }
    catch (error) {
        console.error('Error sending email to %s %o', sendToEmailAddress, error);
        return false;
    }
});
module.exports = sendEmail;
