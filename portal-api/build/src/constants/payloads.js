"use strict";
const BANK = {
    id: String,
    name: String,
    mga: Object,
    emails: Object,
    companiesHouseNo: String,
    partyUrn: String,
    hasGefAccessOnly: Boolean,
    paymentOfficerTeam: Object,
    utilisationReportPeriodSchedule: Object,
    isVisibleInTfmUtilisationReports: Boolean,
};
const PORTAL = {
    USER: {
        username: String,
        firstname: String,
        surname: String,
        email: String,
        timezone: String,
        roles: Object,
        bank: Object,
        'user-status': String,
        salt: String,
        hash: String,
    },
};
const CRITERIA = {
    ELIGIBILITY: {
        version: Number,
        product: String,
        isInDraft: Boolean,
        createdAt: Number,
        criteria: Object,
    },
    MANDATORY: {
        DEFAULT: {
            version: Number,
            criteria: Object,
        },
        VERSIONED: {
            version: Number,
            isInDraft: Boolean,
            title: String,
            introText: String,
            criteria: Object,
            createdAt: String,
            updatedAt: Object,
        },
    },
};
module.exports = {
    BANK,
    PORTAL,
    CRITERIA,
};
