"use strict";
const tslib_1 = require("tslib");
const axios = require('axios');
const { companiesHouseError } = require('./validation/external');
const { isValidRegex, isValidCompaniesHouseNumber } = require('../../validation/validateIds');
const { UK_POSTCODE } = require('../../../constants/regex');
require('dotenv').config();
const { ERROR } = require('../enums');
const mapCompaniesHouseData = require('../mappings/map-companies-house-data');
const externalApi = require('../../../external-api/api');
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': String(EXTERNAL_API_KEY),
};
const findSicCodes = (companySicCodes) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios({
        method: 'get',
        url: `${EXTERNAL_API_URL}/industry-sectors`,
        headers,
    });
    if (companySicCodes && response && response.data) {
        const industries = [];
        companySicCodes.forEach((companySicCode) => {
            response.data.industrySectors.forEach((industrySector) => {
                industrySector.classes.forEach((industryClass) => {
                    if (industryClass.code === companySicCode) {
                        industries.push({ code: industrySector.code, name: industrySector.name, class: industryClass });
                    }
                });
            });
        });
        return industries;
    }
    return null;
});
exports.getByRegistrationNumber = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const companyNumber = req.params.number;
        if (!companyNumber || companyNumber === '') {
            return res.status(422).send([
                {
                    status: 422,
                    errCode: ERROR.MANDATORY_FIELD,
                    errRef: 'regNumber',
                    errMsg: 'Enter a Companies House registration number.',
                },
            ]);
        }
        if (!isValidCompaniesHouseNumber(companyNumber)) {
            console.error('Get company house information API failed for companyNumber %s', companyNumber);
            // returns invalid companies house registration number error
            return res.status(400).send([
                {
                    status: 400,
                    errCode: 'company-profile-not-found',
                    errRef: 'regNumber',
                    errMsg: 'Invalid Companies House registration number',
                },
            ]);
        }
        const response = yield externalApi.companiesHouse.getCompanyProfileByCompanyRegistrationNumber(companyNumber);
        if (response.data.type === 'oversea-company') {
            return res.status(422).send([
                {
                    status: 422,
                    errCode: ERROR.OVERSEAS_COMPANY,
                    errRef: 'regNumber',
                    errMsg: 'UKEF can only process applications from companies based in the UK.',
                },
            ]);
        }
        const industries = yield findSicCodes(response.data.sic_codes);
        const mappedData = mapCompaniesHouseData(response.data, industries);
        return res.status(200).send(mappedData);
    }
    catch (error) {
        console.error('getByRegistrationNumber Error %o', (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
        const { status, response } = companiesHouseError(error);
        return res.status(status).send(response);
    }
});
exports.getAddressesByPostcode = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    try {
        const { postcode } = req.params;
        if (!isValidRegex(UK_POSTCODE, postcode)) {
            console.error('Get addresses by postcode failed for postcode %s', postcode);
            return res.status(400).send([
                {
                    status: 400,
                    errCode: 'ERROR',
                    errRef: 'postcode',
                    errMsg: 'Invalid postcode',
                },
            ]);
        }
        const response = yield externalApi.ordnanceSurvey.getAddressesByPostcode(postcode);
        const addresses = [];
        if (!((_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.results)) {
            return res.status(422).send([
                {
                    status: 422,
                    errCode: 'ERROR',
                    errRef: 'postcode',
                },
            ]);
        }
        response.data.results.forEach((item) => {
            if (item.DPA.LANGUAGE === (req.query.language ? req.query.language : 'EN')) {
                // Ordnance survey sends duplicated results with the welsh version too via 'CY'
                addresses.push({
                    organisationName: item.DPA.ORGANISATION_NAME || null,
                    addressLine1: `${item.DPA.BUILDING_NAME || ''} ${item.DPA.BUILDING_NUMBER || ''} ${item.DPA.THOROUGHFARE_NAME || ''}`.trim(),
                    addressLine2: item.DPA.DEPENDENT_LOCALITY || null,
                    addressLine3: null, // keys to match registered Address as requested, but not available in OS Places
                    locality: item.DPA.POST_TOWN || null,
                    postalCode: item.DPA.POSTCODE || null,
                    country: null, // keys to match registered Address as requested, but not available in OS Places
                });
            }
        });
        return res.status(200).send(addresses);
    }
    catch (error) {
        let { status } = error.response;
        if (status >= 400 && status < 500) {
            status = 422;
        }
        const response = [
            {
                status,
                errCode: 'ERROR',
                errRef: 'postcode',
                errMsg: ((_e = (_d = (_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) === null || _e === void 0 ? void 0 : _e.message) || {},
            },
        ];
        return res.status(status).send(response);
    }
});
