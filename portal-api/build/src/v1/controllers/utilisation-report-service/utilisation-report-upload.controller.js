"use strict";
const tslib_1 = require("tslib");
const api = require('../../api');
const sendEmail = require('../../email');
const { EMAIL_TEMPLATE_IDS, FILESHARES } = require('../../../constants');
const { formatDateForEmail } = require('../../helpers/formatDateForEmail');
const { uploadFile } = require('../../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../../utils');
const { PDC_INPUTTERS_EMAIL_RECIPIENT } = process.env;
/**
 * Calls the DTFS Central API to get bank details by bank ID and
 * returns only the payment officer team name and email
 * @param {string} bankId - the bank ID
 * @returns {Promise} payment officer team name and email
 */
const getPaymentOfficerTeamDetailsFromBank = (bankId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield api.getBankById(bankId);
        const { teamName, email } = data.paymentOfficerTeam;
        return { teamName, email };
    }
    catch (error) {
        console.error('Unable to get bank payment officer team details by ID %o', error);
        return { status: (error === null || error === void 0 ? void 0 : error.code) || 500, data: 'Failed to get bank payment officer team details by ID' };
    }
});
/**
 * Sends notification email to PDC Inputters that a utilisation report has been submitted
 * @param {string} bankName - name of the bank
 * @param {string} reportPeriod - period for which the report covers as a string, eg. June 2023
 */
const sendEmailToPdcInputtersEmail = (bankName, reportPeriod) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_NOTIFICATION, PDC_INPUTTERS_EMAIL_RECIPIENT, {
        bankName,
        reportPeriod,
    });
});
/**
 * Sends notification email to bank payment officer team that a utilisation report has been
 * received and return the payment officer team email address.
 * @param {string} reportPeriod - period for which the report covers as a string, eg. June 2023
 * @param {string} bankId - the bank ID
 * @param {Date} submittedDate - the date the report was submitted
 * @param {string} submittedBy - the name of the user who submitted the report as a string
 * @returns {Promise} returns object with payment officer email or an error
 */
const sendEmailToBankPaymentOfficerTeam = (reportPeriod, bankId, submittedDate, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const reportSubmittedBy = `${user.firstname} ${user.surname}`;
        const { teamName, email } = yield getPaymentOfficerTeamDetailsFromBank(bankId);
        const formattedSubmittedDate = formatDateForEmail(submittedDate);
        yield sendEmail(EMAIL_TEMPLATE_IDS.UTILISATION_REPORT_CONFIRMATION, email, {
            recipient: teamName,
            reportPeriod,
            reportSubmittedBy,
            reportSubmittedDate: formattedSubmittedDate,
        });
        return { paymentOfficerEmail: email };
    }
    catch (error) {
        console.error('Unable to get payment officer team details and send email %o', error);
        return { status: (error === null || error === void 0 ? void 0 : error.code) || 500, data: 'Failed to get payment officer team details and send email' };
    }
});
/**
 * Saves file to Azure in utilisation-reports ShareClient, returns the file storage info
 * @param {object} file
 * @param {string} bankId - bank id as a string
 * @returns {Promise<object>} - azure storage details with folder & file name, full path & url.
 */
const saveFileToAzure = (file, bankId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.info(`Attempting to save utilisation report to Azure for bank: ${bankId}`);
        const { originalname, buffer } = file;
        const fileInfo = yield uploadFile({
            fileshare: FILESHARES.UTILISATION_REPORTS,
            folder: bankId,
            filename: formatFilenameForSharepoint(originalname),
            buffer,
            allowOverwrite: true,
        });
        if (!fileInfo || fileInfo.error) {
            throw new Error(`Failed to save utilisation report to Azure - ${(_b = (_a = fileInfo === null || fileInfo === void 0 ? void 0 : fileInfo.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'cause unknown'}`);
        }
        console.info(`Successfully saved utilisation report to Azure for bank: ${bankId}`);
        return fileInfo;
    }
    catch (error) {
        console.error('Failed to save utilisation report to Azure ', error);
        throw error;
    }
});
const uploadReportAndSendNotification = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g;
    try {
        const { file } = req;
        const { formattedReportPeriod, reportData, reportPeriod, user } = req.body;
        const parsedReportData = JSON.parse(reportData);
        const parsedUser = JSON.parse(user);
        const parsedReportPeriod = JSON.parse(reportPeriod);
        if (!file) {
            return res.status(400).send();
        }
        // If a report has already been uploaded, we should not overwrite it
        const uploadedReportsInReportPeriod = yield api.getUtilisationReports((_c = parsedUser === null || parsedUser === void 0 ? void 0 : parsedUser.bank) === null || _c === void 0 ? void 0 : _c.id, {
            reportPeriod: parsedReportPeriod,
            excludeNotUploaded: true,
        });
        if (uploadedReportsInReportPeriod.length > 0) {
            return res.status(409).send('Report for the supplied report period has already been uploaded');
        }
        const fileInfo = yield saveFileToAzure(file, parsedUser.bank.id);
        const azureFileInfo = Object.assign(Object.assign({}, fileInfo), { mimetype: file.mimetype });
        const saveDataResponse = yield api.saveUtilisationReport(parsedReportData, parsedReportPeriod, parsedUser, azureFileInfo);
        if (saveDataResponse.status !== 201) {
            const status = saveDataResponse.status || 500;
            console.error('Failed to save utilisation report %o', saveDataResponse);
            return res.status(status).send('Failed to save utilisation report');
        }
        yield sendEmailToPdcInputtersEmail((_d = parsedUser === null || parsedUser === void 0 ? void 0 : parsedUser.bank) === null || _d === void 0 ? void 0 : _d.name, formattedReportPeriod);
        const { paymentOfficerEmail } = yield sendEmailToBankPaymentOfficerTeam(formattedReportPeriod, (_e = parsedUser === null || parsedUser === void 0 ? void 0 : parsedUser.bank) === null || _e === void 0 ? void 0 : _e.id, new Date(saveDataResponse.data.dateUploaded), parsedUser);
        return res.status(201).send({ paymentOfficerEmail });
    }
    catch (error) {
        console.error('Failed to save utilisation report %o', error);
        return res.status((_g = (_f = error.response) === null || _f === void 0 ? void 0 : _f.status) !== null && _g !== void 0 ? _g : 500).send('Failed to save utilisation report');
    }
});
module.exports = {
    uploadReportAndSendNotification,
    saveFileToAzure,
};
